import { chatComAgenteStream } from '../api/gardiaCoreClient.js';
import { falarTexto, pararFala } from '../api/tts.js';
import { db } from '../db/schema.js';
import { ChatService } from '../services/chatService.js';
import { logger } from '../utils/logger.js';
import { Theme } from '../utils/theme.js';

const TURNO_GLOBAL_ID = 0;

export function GardiaFloat() {
  const root = document.createElement('div');
  root.className = 'gardia-float';
  root.innerHTML = template();

  const estado = {
    aberto: false,
    visivel: true,
    ouvindo: false,
    streamingAtivo: false,
    reconhecimento: null,
    historico: [],
  };

  iniciarVoz(root, estado);
  bindEventos(root, estado);
  atualizarVisibilidade(root, estado, rotaAtual());

  root.destruir = () => destruir(root, estado);
  return root;
}

function bindEventos(root, estado) {
  root.querySelector('#gardia-float-btn')?.addEventListener('click', () => alternarDrawer(root, estado));
  root.querySelector('#gardia-float-close')?.addEventListener('click', () => fecharDrawer(root, estado));
  root.querySelector('#gardia-float-tema')?.addEventListener('click', () => Theme.alternar());
  root.querySelector('#gardia-float-overlay')?.addEventListener('click', () => fecharDrawer(root, estado));
  root.querySelector('#gardia-float-send')?.addEventListener('click', () => enviarMensagem(root, estado));
  root.querySelector('#gardia-float-mic')?.addEventListener('click', () => alternarMicrofone(root, estado));
  Theme.aplicar(Theme.atual());

  root.querySelector('#gardia-float-text')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    enviarMensagem(root, estado);
  });

  estado.handleKeyDown = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      alternarDrawer(root, estado);
      return;
    }

    if (estado.aberto && e.ctrlKey && (e.code === 'Space' || e.key === ' ')) {
      e.preventDefault();
      alternarMicrofone(root, estado);
    }
  };

  estado.handleRouteChange = (e) => {
    atualizarVisibilidade(root, estado, e.detail?.path ?? rotaAtual());
  };

  document.addEventListener('keydown', estado.handleKeyDown, true);
  window.addEventListener('routechange', estado.handleRouteChange);
}

function destruir(root, estado) {
  try { estado.reconhecimento?.stop(); } catch {}
  estado.reconhecimento = null;
  pararFala();
  document.removeEventListener('keydown', estado.handleKeyDown, true);
  window.removeEventListener('routechange', estado.handleRouteChange);
  root.remove();
}

function atualizarVisibilidade(root, estado, path) {
  const ocultar = path === '/portaria/desktop';
  estado.visivel = !ocultar;
  root.classList.toggle('hidden', ocultar);

  if (ocultar) fecharDrawer(root, estado);
}

function alternarDrawer(root, estado) {
  if (!estado.visivel) return;
  estado.aberto ? fecharDrawer(root, estado) : abrirDrawer(root, estado);
}

function abrirDrawer(root, estado) {
  estado.aberto = true;
  root.classList.add('gardia-float--open');
  root.querySelector('#gardia-float-text')?.focus();
}

function fecharDrawer(root, estado) {
  estado.aberto = false;
  root.classList.remove('gardia-float--open');
}

async function enviarMensagem(root, estado, textoEntrada = null) {
  if (estado.streamingAtivo) return;

  const input = root.querySelector('#gardia-float-text');
  const texto = (textoEntrada ?? input?.value ?? '').trim();
  if (!texto) return;

  if (input) input.value = '';
  adicionarMensagem(root, 'porteiro', texto);
  estado.historico.push({ remetente: 'porteiro', texto });

  let condominioId = null;

  try {
    const condominio = await db.condominios.where('ativo').equals(1).first();
    condominioId = condominio?.id ?? null;
    if (!condominioId) throw new Error('Nenhum condominio ativo encontrado');

    await ChatService.salvarMensagem({
      turnoId: TURNO_GLOBAL_ID,
      condominioId,
      remetente: 'porteiro',
      texto,
    });
  } catch (err) {
    logger.error('GardiaFloat.salvarPergunta', err);
    adicionarMensagemSistema(root, 'Nao consegui acessar o contexto local agora.');
    return;
  }

  const idDigitando = adicionarDigitando(root);
  estado.streamingAtivo = true;
  atualizarBotao(root, estado);

  try {
    const contexto = await ChatService.buscarContexto(condominioId, TURNO_GLOBAL_ID);
    contexto.historico = estado.historico;

    removerDigitando(root, idDigitando);
    const balao = criarBalaoStreaming(root);
    let respostaCompleta = '';

    for await (const chunk of chatComAgenteStream({
      ...contexto,
      pergunta: texto,
    })) {
      respostaCompleta += chunk;
      if (balao) balao.textContent = respostaCompleta;
      scrollParaFim(root);
    }

    if (balao) balao.textContent = respostaCompleta;
    estado.historico.push({ remetente: 'agente', texto: respostaCompleta });

    await ChatService.salvarMensagem({
      turnoId: TURNO_GLOBAL_ID,
      condominioId,
      remetente: 'agente',
      texto: respostaCompleta,
    });

    falarResposta(respostaCompleta);
  } catch (err) {
    logger.error('GardiaFloat.enviarMensagem', err);
    removerDigitando(root, idDigitando);
    adicionarMensagemSistema(root, 'Tive um problema para responder. Tente novamente em instantes.');
  } finally {
    estado.streamingAtivo = false;
    atualizarBotao(root, estado);
  }
}

function iniciarVoz(root, estado) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    logger.warn('GardiaFloat.iniciarVoz', 'SpeechRecognition indisponivel');
    root.querySelector('#gardia-float-mic')?.setAttribute('disabled', 'true');
    return;
  }

  const rec = new SR();
  rec.lang = 'pt-BR';
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e) => {
    const transcricao = Array.from(e.results).map((r) => r[0].transcript).join('');
    const input = root.querySelector('#gardia-float-text');
    if (input) input.value = transcricao;

    if (e.results[e.results.length - 1].isFinal && transcricao.trim()) {
      window.setTimeout(() => enviarMensagem(root, estado, transcricao.trim()), 200);
    }
  };

  rec.onstart = () => {
    estado.ouvindo = true;
    atualizarBotao(root, estado);
  };

  rec.onend = () => {
    estado.ouvindo = false;
    atualizarBotao(root, estado);
  };

  rec.onerror = (e) => {
    estado.ouvindo = false;
    atualizarBotao(root, estado);
    if (e.error !== 'no-speech') logger.warn('GardiaFloat.SpeechRecognition', e.error);
  };

  estado.reconhecimento = rec;
}

function alternarMicrofone(root, estado) {
  if (estado.streamingAtivo) return;

  if (estado.ouvindo) {
    try { estado.reconhecimento?.stop(); } catch (err) { logger.warn('GardiaFloat.pararMic', err); }
    return;
  }

  if (!estado.reconhecimento) {
    adicionarMensagemSistema(root, 'Microfone nao disponivel neste navegador.');
    return;
  }

  try {
    estado.reconhecimento.start();
  } catch (err) {
    if (err.name !== 'InvalidStateError') logger.warn('GardiaFloat.iniciarMic', err);
  }
}

function falarResposta(texto) {
  falarTexto(texto);
}

function atualizarBotao(root, estado) {
  const btn = root.querySelector('#gardia-float-btn');
  const mic = root.querySelector('#gardia-float-mic');

  btn?.classList.toggle('gardia-float-btn--streaming', estado.streamingAtivo);
  btn?.classList.toggle('gardia-float-btn--ouvindo', estado.ouvindo);
  mic?.classList.toggle('gardia-float-mic--ouvindo', estado.ouvindo);
}

function adicionarMensagem(root, remetente, texto) {
  const lista = root.querySelector('#gardia-float-msgs');
  if (!lista) return;

  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');

  if (remetente === 'porteiro') {
    div.className = 'msg-porteiro';
    div.innerHTML = `
      <div>
        <div class="msg-porteiro-balao">${escapeHtml(texto)}</div>
        <div class="msg-hora">${hora}</div>
      </div>`;
  } else {
    div.className = 'msg-agente';
    div.innerHTML = `
      <div class="msg-agente-avatar">G</div>
      <div>
        <div class="msg-agente-balao">${escapeHtml(texto)}</div>
        <div class="msg-hora">${hora}</div>
      </div>`;
  }

  lista.appendChild(div);
  scrollParaFim(root);
}

function criarBalaoStreaming(root) {
  const lista = root.querySelector('#gardia-float-msgs');
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  const wrapper = document.createElement('div');
  const balao = document.createElement('div');

  div.className = 'msg-agente';
  balao.className = 'msg-agente-balao';
  div.innerHTML = '<div class="msg-agente-avatar">G</div>';
  wrapper.appendChild(balao);
  wrapper.insertAdjacentHTML('beforeend', `<div class="msg-hora">${hora}</div>`);
  div.appendChild(wrapper);
  lista?.appendChild(div);
  scrollParaFim(root);

  return balao;
}

function adicionarDigitando(root) {
  const lista = root.querySelector('#gardia-float-msgs');
  if (!lista) return null;

  const id = `gardia-float-digitando-${Date.now()}`;
  const div = document.createElement('div');
  div.id = id;
  div.className = 'msg-agente';
  div.innerHTML = `
    <div class="msg-agente-avatar">G</div>
    <div class="msg-agente-balao">
      <div class="digitando-dots">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  lista.appendChild(div);
  scrollParaFim(root);
  return id;
}

function removerDigitando(root, id) {
  if (id) root.querySelector(`#${id}`)?.remove();
}

function adicionarMensagemSistema(root, texto) {
  const lista = root.querySelector('#gardia-float-msgs');
  const div = document.createElement('div');
  div.className = 'msg-sistema';
  div.textContent = texto;
  lista?.appendChild(div);
  scrollParaFim(root);
}

function scrollParaFim(root) {
  const lista = root.querySelector('#gardia-float-msgs');
  if (lista) lista.scrollTop = lista.scrollHeight;
}

function rotaAtual() {
  const hash = window.location.hash.slice(1);
  return hash.startsWith('/') ? hash : '/';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function template() {
  return `
    <button id="gardia-float-btn" class="gardia-float-btn" title="Abrir Gardia">
      <span>G</span>
    </button>
    <div id="gardia-float-overlay" class="gardia-float-overlay"></div>
    <aside class="gardia-float-drawer" aria-label="Gardia global">
      <header class="gardia-float-header">
        <div class="gardia-float-title">
          <div class="msg-agente-avatar">G</div>
          <span>Gardia</span>
        </div>
        <div class="gardia-float-header-actions">
          <button id="gardia-float-close" class="gardia-float-icon-btn" title="Fechar" aria-label="Fechar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <button id="gardia-float-tema" data-btn-tema class="gardia-float-icon-btn"
                  title="Alternar tema" aria-label="Alternar tema"></button>
        </div>
      </header>

      <div id="gardia-float-msgs" class="gardia-float-msgs"></div>

      <div class="gardia-float-input">
        <button id="gardia-float-mic" class="gardia-float-icon-btn" title="Microfone (Ctrl+Space)" aria-label="Microfone">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        </button>
        <input id="gardia-float-text" class="input" type="text"
               placeholder="Pergunte a Gardia..." autocomplete="off" />
        <button id="gardia-float-send" class="btn-primary">Enviar</button>
      </div>
    </aside>
  `;
}
