import db from '../db/schema.js';
import { chatComAgenteStream } from '../api/gardiaCoreClient.js';
import { falarTexto, pararFala } from '../api/tts.js';
import { logger } from '../utils/logger.js';
import { renderSidebar } from '../components/layout/Sidebar.js';
import { push } from '../router.js';

const TURNO_GLOBAL_ID = 0;

export function Dashboard() {
  const el = document.createElement('div');
  el.className = 'gardia-ai-cockpit';
  
  const estado = {
    condominio: null,
    condominioId: null,
    contractId: null,
    instrucoes: [],
    eventos: [],
    historico: [],
    ouvindo: false,
    streamingAtivo: false,
    reconhecimento: null,
  };

  // Inicialização assíncrona dos dados
  inicializarDados(el, estado);

  return el;
}

export default Dashboard;

async function inicializarDados(root, estado) {
  try {
    // 1. Buscar condomínio ativo no Dexie local
    const condominio = await db.condominios.where('ativo').equals(1).first();
    if (!condominio) {
      renderVazio(root);
      return;
    }
    
    estado.condominio = condominio;
    estado.condominioId = condominio.id;
    estado.contractId = condominio.contractId || null; // UUID do RAG

    // 2. Buscar instruções de turno (checklist) no Dexie
    estado.instrucoes = await db.instrucoes
      .where('condominioId').equals(condominio.id)
      .toArray();

    // 3. Buscar mensagens locais do turno no Dexie
    estado.historico = await db.mensagens
      .where('turnoId').equals(TURNO_GLOBAL_ID)
      .sortBy('criadoEm');

    // 4. Buscar eventos (rondas e logs) no Dexie para popular a aba de eventos
    const rondas = await db.rondas.toArray();
    estado.eventos = rondas.map(r => ({
      tipo: r.realizadaEm ? 'ok' : 'alerta',
      titulo: r.realizadaEm ? 'Ronda concluida' : 'Ronda pendente',
      descricao: r.realizadaEm ? 'Garagem B e areas comuns vistoriadas' : 'Ronda programada para vistoria',
      hora: new Date(r.realizadaEm || r.agendadaEm || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));

    if (estado.eventos.length === 0) {
      estado.eventos = [
        { tipo: 'ok', titulo: 'Ronda concluida', descricao: 'Turno noturno confirmado na garagem B', hora: '02:18' },
        { tipo: 'alerta', titulo: 'Ocorrencia registrada', descricao: 'Barulho ap. 302 em acompanhamento', hora: '23:41' },
        { tipo: 'neutro', titulo: 'Contrato monitorado', descricao: 'Limpeza vence em 8 dias', hora: '18:05' },
      ];
    }

    // Renderizar template dinâmico
    root.innerHTML = template(estado);
    const sidebarSlot = root.querySelector('#gardia-ai-sidebar-slot');
    if (sidebarSlot && !sidebarSlot.querySelector('#app-sidebar')) {
      sidebarSlot.appendChild(renderSidebar('/dashboard'));
    }

    // Bind de eventos e serviços do chat/reconhecimento
    bind(root, estado);
    iniciarVoz(root, estado);
    atualizarMensagensUI(root, estado);

  } catch (err) {
    logger.error('Dashboard.inicializarDados', err);
    renderVazio(root, 'Erro ao carregar dados operacionais.');
  }
}

function renderVazio(root, msg = 'Nenhum condominio ativo encontrado.') {
  root.innerHTML = `
    <main class="gardia-ai-center gardia-ai-empty-state">
      <div class="gardia-ai-empty-icon">!</div>
      <strong class="gardia-ai-empty-title">${msg}</strong>
      <p class="gardia-ai-empty-desc">Ative um condominio nas configuracoes locais para prosseguir.</p>
    </main>
  `;
}

function bind(root, estado) {
  root.querySelector('#gardia-ai-menu-btn')?.addEventListener('click', () => {
    closeFloatingPanels(root);
    togglePanel(root, 'left');
  });
  root.querySelector('#gardia-ai-history-btn')?.addEventListener('click', () => {
    closeFloatingPanels(root);
    togglePanel(root, 'right');
    ativarAba(root, 'conversa');
  });
  root.querySelector('#gardia-ai-contacts-btn')?.addEventListener('click', () => {
    closePanel(root, 'left');
    closePanel(root, 'right');
    toggleFloatingPanel(root, 'emergencias');
  });
  root.querySelector('#gardia-ai-checklist-btn')?.addEventListener('click', () => {
    closePanel(root, 'left');
    closePanel(root, 'right');
    toggleFloatingPanel(root, 'acoes');
  });

  root.querySelectorAll('[data-quick-route]').forEach((button) => {
    button.addEventListener('click', () => {
      closeFloatingPanels(root);
      root.querySelector('.gardia-center-text')?.classList.add('gardia-center-text--hidden');
      push(button.dataset.quickRoute);
    });
  });

  root.querySelector('#gardia-ai-close-left')?.addEventListener('click', () => closePanel(root, 'left'));
  root.querySelector('#gardia-ai-close-right')?.addEventListener('click', () => closePanel(root, 'right'));
  root.querySelector('#gardia-ai-sidebar-overlay')?.addEventListener('click', () => {
    setSidebarVisibility(root, false);
    closePanel(root, 'left');
  });

  root.querySelectorAll('[data-gardia-tab]').forEach((button) => {
    button.addEventListener('click', () => ativarAba(root, button.dataset.gardiaTab));
  });

  // Eventos do chat
  root.querySelector('#gardia-chat-send')?.addEventListener('click', () => enviarMensagem(root, estado));
  root.querySelector('#gardia-chat-mic')?.addEventListener('click', () => alternarMicrofone(root, estado));
  root.querySelector('#gardia-chat-input')?.addEventListener('focus', () => setGardiaStatus('ouvindo'));
  root.querySelector('#gardia-chat-input')?.addEventListener('blur', () => {
    if (!estado.streamingAtivo) setGardiaStatus('inativo');
  });
  root.querySelector('#gardia-chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarMensagem(root, estado);
    }
  });

  const closeLeft = () => closePanel(root, 'left');
  const hideCenterText = () => root.querySelector('.gardia-center-text')?.classList.add('gardia-center-text--hidden');
  const closeFloatingOutside = (event) => {
    if (!root.contains(event.target)) return;
    if (event.target.closest('.gardia-ai-corner-btn, .gardia-ai-floating-panel')) return;
    closeFloatingPanels(root);
  };
  window.addEventListener('gardia-ai-close-left-panel', closeLeft);
  window.addEventListener('gardia:center-text-hide', hideCenterText);
  document.addEventListener('click', closeFloatingOutside);
  root._cleanup = () => {
    window.removeEventListener('gardia-ai-close-left-panel', closeLeft);
    window.removeEventListener('gardia:center-text-hide', hideCenterText);
    document.removeEventListener('click', closeFloatingOutside);
    window.gardiaOrbScale = 1;
    setGardiaStatus('inativo');
    try { estado.reconhecimento?.stop(); } catch {}
    pararFala();
  };
}

function togglePanel(root, side) {
  const className = side === 'left' ? 'gardia-ai-cockpit--left-open' : 'gardia-ai-cockpit--right-open';
  root.classList.toggle(className);
  if (side === 'left') {
    const aberto = root.classList.contains(className);
    setSidebarVisibility(root, aberto);
    if (aberto) window.dispatchEvent(new CustomEvent('gardia:pulse'));
  }
  if (side === 'right') {
    window.gardiaOrbScale = root.classList.contains(className) ? 0.85 : 1;
  }
}

function closePanel(root, side) {
  const className = side === 'left' ? 'gardia-ai-cockpit--left-open' : 'gardia-ai-cockpit--right-open';
  root.classList.remove(className);
  if (side === 'left') {
    setSidebarVisibility(root, false);
  }
  if (side === 'right') {
    window.gardiaOrbScale = 1;
  }
}

function toggleFloatingPanel(root, panel) {
  const className = panel === 'emergencias' ? 'gardia-ai-cockpit--emergency-open' : 'gardia-ai-cockpit--actions-open';
  const otherClass = panel === 'emergencias' ? 'gardia-ai-cockpit--actions-open' : 'gardia-ai-cockpit--emergency-open';

  root.classList.toggle(className);
  root.classList.remove(otherClass);
}

function closeFloatingPanels(root) {
  root.classList.remove('gardia-ai-cockpit--emergency-open', 'gardia-ai-cockpit--actions-open');
}

function setGardiaStatus(status) {
  window.gardiaStatus = status;
  window.gardiaStatusVoz = status;
}

function setSidebarVisibility(root, visible) {
  const sidebar = root.querySelector('#app-sidebar');
  if (!sidebar) return;

  sidebar.classList.toggle('sidebar--visible', visible);
  sidebar.classList.toggle('sidebar--hidden', !visible);
}

function ativarAba(root, aba) {
  root.querySelectorAll('[data-gardia-tab]').forEach((button) => {
    button.classList.toggle('gardia-ai-tab--active', button.dataset.gardiaTab === aba);
  });

  root.querySelectorAll('[data-gardia-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.gardiaPanel !== aba;
  });
}

async function enviarMensagem(root, estado) {
  if (estado.streamingAtivo) return;

  const input = root.querySelector('#gardia-chat-input');
  const texto = (input?.value || '').trim();
  if (!texto) return;

  if (input) input.value = '';
  
  // 1. Salvar e adicionar mensagem do operador
  estado.historico.push({ remetente: 'porteiro', texto, criadoEm: Date.now() });
  await db.mensagens.add({
    turnoId: TURNO_GLOBAL_ID,
    condominioId: estado.condominioId,
    remetente: 'porteiro',
    texto,
    criadoEm: Date.now()
  });
  
  atualizarMensagensUI(root, estado);

  // 2. Estado de digitação e alteração visual do orbe
  estado.streamingAtivo = true;
  setGardiaStatus('processando');
  adicionarDigitandoUI(root);

  try {
    let respostaCompleta = '';
    let primeiraResposta = false;

    // 3. Chamada ao backend Express local (através de gardiaCoreClient.js)
    for await (const chunk of chatComAgenteStream({
      pergunta: texto,
      historico: estado.historico,
      contractId: estado.contractId, // Envia o UUID real para o RAG
      userRole: 'porteiro',
      userName: window.gardiaPapel ?? 'Porteiro'
    })) {
      if (!primeiraResposta) {
        primeiraResposta = true;
        setGardiaStatus('respondendo');
      }
      respostaCompleta += chunk;
    }

    removerDigitandoUI(root);

    // 4. Salvar resposta da Gardia no Dexie local e histórico
    estado.historico.push({ remetente: 'agente', texto: respostaCompleta, criadoEm: Date.now() });
    await db.mensagens.add({
      turnoId: TURNO_GLOBAL_ID,
      condominioId: estado.condominioId,
      remetente: 'agente',
      texto: respostaCompleta,
      criadoEm: Date.now()
    });

    atualizarMensagensUI(root, estado);

    // 5. Acionar resposta de Voz
    falarResposta(respostaCompleta);

  } catch (err) {
    logger.error('Dashboard.enviarMensagem', err);
    removerDigitandoUI(root);
    adicionarMensagemSistemaUI(root, 'Estou com dificuldades para responder. Verifique o servidor local.');
  } finally {
    estado.streamingAtivo = false;
    setTimeout(() => setGardiaStatus('inativo'), 2000);
  }
}

function falarResposta(texto) {
  window.gardiaStatusVoz = "respondendo";
  falarTexto(texto);
  
  // Retornar ao repouso quando a fala concluir
  if (window.speechSynthesis) {
    const checkSpeech = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        window.gardiaStatusVoz = window.gardiaStatus || "inativo";
        clearInterval(checkSpeech);
      }
    }, 250);
  } else {
    setTimeout(() => { window.gardiaStatusVoz = window.gardiaStatus || "inativo"; }, 3000);
  }
}

function iniciarVoz(root, estado) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    logger.warn('Dashboard.iniciarVoz', 'SpeechRecognition indisponivel no navegador');
    root.querySelector('#gardia-chat-mic')?.setAttribute('disabled', 'true');
    return;
  }

  const rec = new SR();
  rec.lang = 'pt-BR';
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e) => {
    const transcricao = Array.from(e.results).map((r) => r[0].transcript).join('');
    const input = root.querySelector('#gardia-chat-input');
    if (input) input.value = transcricao;

    if (e.results[e.results.length - 1].isFinal && transcricao.trim()) {
      window.setTimeout(() => {
        enviarMensagem(root, estado);
      }, 300);
    }
  };

  rec.onstart = () => {
    estado.ouvindo = true;
    setGardiaStatus('ouvindo');
    atualizarBotaoMicUI(root, true);
  };

  rec.onend = () => {
    estado.ouvindo = false;
    if (window.gardiaStatus === "ouvindo") {
      setGardiaStatus('inativo');
    }
    atualizarBotaoMicUI(root, false);
  };

  rec.onerror = (e) => {
    estado.ouvindo = false;
    setGardiaStatus('inativo');
    atualizarBotaoMicUI(root, false);
    if (e.error !== 'no-speech') {
      logger.warn('Dashboard.SpeechRecognitionError', e.error);
    }
  };

  estado.reconhecimento = rec;
}

function alternarMicrofone(root, estado) {
  if (estado.streamingAtivo) return;
  pararFala();

  if (estado.ouvindo) {
    try { estado.reconhecimento?.stop(); } catch {}
    return;
  }

  try {
    estado.reconhecimento.start();
  } catch (err) {
    logger.warn('Dashboard.alternarMicrofone', err);
  }
}

function atualizarBotaoMicUI(root, ouvindo) {
  const mic = root.querySelector('#gardia-chat-mic');
  if (mic) {
    mic.classList.toggle('gardia-ai-mic--active', ouvindo);
  }
}

function atualizarMensagensUI(root, estado) {
  const painel = root.querySelector('#gardia-chat-msgs-container');
  if (!painel) return;

  if (estado.historico.length === 0) {
    painel.innerHTML = `
      <article class="gardia-ai-message gardia-ai-message--gardia">
        <span>Gardia</span>
        <p>Estou monitorando as operacoes e regulamentos do <strong>${estado.condominio.nome}</strong>. Como posso ajudar seu turno hoje?</p>
      </article>
    `;
    return;
  }

  painel.innerHTML = estado.historico.map(renderMensagem).join('');
  scrollParaFim(root);
}

function adicionarDigitandoUI(root) {
  const painel = root.querySelector('#gardia-chat-msgs-container');
  if (!painel) return;

  const div = document.createElement('article');
  div.id = 'gardia-chat-digitando';
  div.className = 'gardia-ai-message gardia-ai-message--gardia';
  div.innerHTML = `
    <span>Gardia</span>
    <p class="gardia-ai-thinking">Pensando...</p>
  `;
  painel.appendChild(div);
  scrollParaFim(root);
}

function removerDigitandoUI(root) {
  root.querySelector('#gardia-chat-digitando')?.remove();
}

function adicionarMensagemSistemaUI(root, texto) {
  const painel = root.querySelector('#gardia-chat-msgs-container');
  if (!painel) return;

  const div = document.createElement('article');
  div.className = 'gardia-ai-message gardia-ai-message--system';
  div.innerHTML = `
    <p class="gardia-ai-system-message">${texto}</p>
  `;
  painel.appendChild(div);
  scrollParaFim(root);
}

function scrollParaFim(root) {
  const container = root.querySelector('#gardia-chat-msgs-scroll');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function template(estado) {
  return `
    <button id="gardia-ai-menu-btn" class="gardia-ai-frosted-control gardia-ai-corner-btn gardia-ai-corner-btn--modules gardia-ai-corner-btn--top-left" type="button" aria-label="Modulos" data-tooltip="Modulos">
      ${iconMenu()}
    </button>
    <button id="gardia-ai-history-btn" class="gardia-ai-frosted-control gardia-ai-corner-btn gardia-ai-corner-btn--gardia gardia-ai-corner-btn--top-right" type="button" aria-label="Falar com a Gardia" data-tooltip="Falar com a Gardia">
      ${iconGardiaChat()}
      <span class="gardia-ai-corner-badge" aria-hidden="true"></span>
    </button>
    <button id="gardia-ai-contacts-btn" class="gardia-ai-frosted-control gardia-ai-corner-btn gardia-ai-corner-btn--emergency gardia-ai-corner-btn--bottom-left" type="button" aria-label="Emergencias" data-tooltip="Emergencias">
      ${iconPhoneCall()}
    </button>
    <button id="gardia-ai-checklist-btn" class="gardia-ai-frosted-control gardia-ai-corner-btn gardia-ai-corner-btn--shift gardia-ai-corner-btn--bottom-right" type="button" aria-label="Acoes do turno" data-tooltip="Acoes do turno">
      ${iconLightning()}
    </button>

    <div id="gardia-ai-emergency-panel" class="gardia-ai-floating-panel gardia-ai-floating-panel--bottom-left" aria-label="Contatos de emergencia">
      <a href="tel:193" class="gardia-ai-floating-item"><span><span class="gardia-ai-floating-icon">&#128658;</span>Bombeiros</span><strong>193</strong></a>
      <a href="tel:192" class="gardia-ai-floating-item"><span><span class="gardia-ai-floating-icon">&#128657;</span>SAMU</span><strong>192</strong></a>
      <a href="tel:190" class="gardia-ai-floating-item"><span><span class="gardia-ai-floating-icon">&#128659;</span>Policia</span><strong>190</strong></a>
      <div class="gardia-ai-floating-separator"></div>
      <a href="tel:+5512998000001" class="gardia-ai-floating-item"><span><span class="gardia-ai-floating-icon">&#128295;</span>Zelador</span><strong>(12)99800-0001</strong></a>
      <a href="tel:+5512997000000" class="gardia-ai-floating-item"><span><span class="gardia-ai-floating-icon">&#128100;</span>Sindico</span><strong>(12)99700-0000</strong></a>
    </div>

    <div id="gardia-ai-actions-panel" class="gardia-ai-floating-panel gardia-ai-floating-panel--bottom-right" aria-label="Acoes rapidas do turno">
      <button class="gardia-ai-floating-item" type="button" data-quick-route="/ocorrencias"><span><span class="gardia-ai-floating-icon">&#9888;</span>Nova Ocorrencia</span></button>
      <button class="gardia-ai-floating-item" type="button" data-quick-route="/rondas"><span><span class="gardia-ai-floating-icon">&#9678;</span>Iniciar Ronda</span></button>
      <button class="gardia-ai-floating-item" type="button" data-quick-route="/acesso"><span><span class="gardia-ai-floating-icon">&#8596;</span>Registrar Acesso</span></button>
      <button class="gardia-ai-floating-item" type="button" data-quick-route="/reservas"><span><span class="gardia-ai-floating-icon">&#9776;</span>Nova Reserva</span></button>
    </div>

    <div id="gardia-ai-sidebar-overlay" class="gardia-ai-sidebar-overlay" aria-hidden="true"></div>

    <aside class="gardia-ai-panel gardia-ai-panel--left" aria-label="Menu operacional da portaria">
      <div class="gardia-ai-panel-header gardia-ai-panel-header--compact">
        <button id="gardia-ai-close-left" class="gardia-ai-frosted-control gardia-ai-panel-close" type="button" aria-label="Fechar menu">${iconClose()}</button>
      </div>
      <div id="gardia-ai-sidebar-slot" class="gardia-ai-panel-slot"></div>
    </aside>

    <aside class="gardia-ai-panel gardia-ai-panel--right" aria-label="Historico operacional">
      <div class="gardia-ai-panel-header">
        <div>
          <span>Plantao ativo</span>
          <strong>${estado.condominio.nome}</strong>
        </div>
        <button id="gardia-ai-close-right" class="gardia-ai-frosted-control gardia-ai-panel-close" type="button" aria-label="Fechar painel">${iconClose()}</button>
      </div>
      <div class="gardia-ai-tabs">
        <button class="gardia-ai-tab gardia-ai-tab--active" data-gardia-tab="conversa" type="button">Conversa</button>
        <button class="gardia-ai-tab" data-gardia-tab="eventos" type="button">Eventos</button>
        <button class="gardia-ai-tab" data-gardia-tab="checklist" type="button">Checklist</button>
      </div>
      <div class="gardia-ai-tab-panels">
        <!-- ABA CONVERSA DINÂMICA -->
        <section data-gardia-panel="conversa" class="gardia-ai-chat-panel">
          <div id="gardia-chat-msgs-scroll" class="gardia-ai-chat-scroll">
            <div id="gardia-chat-msgs-container" class="gardia-ai-chat-list">
              <!-- Mensagens populadas via JS -->
            </div>
          </div>
          <div class="gardia-ai-chat-input-wrapper">
            <button id="gardia-chat-mic" class="gardia-ai-tab gardia-ai-chat-mic" type="button" title="Microfone" aria-label="Microfone">
              ${iconMic()}
            </button>
            <input id="gardia-chat-input" type="text" placeholder="Pergunte a Gardia..." class="input gardia-ai-chat-input" autocomplete="off" />
            <button id="gardia-chat-send" class="btn-primary gardia-ai-chat-send" type="button" aria-label="Enviar mensagem">${iconSend()}</button>
          </div>
        </section>

        <!-- ABA EVENTOS DINÂMICA -->
        <section data-gardia-panel="eventos" hidden>
          ${estado.eventos.map(renderEvento).join('')}
        </section>

        <!-- ABA CHECKLIST DINÂMICA -->
        <section data-gardia-panel="checklist" hidden>
          ${estado.instrucoes.length > 0 
            ? estado.instrucoes.map(renderChecklist).join('')
            : renderChecklist({ prioridade: 'normal', texto: 'Nenhuma instrucao pendente para este turno.' })
          }
        </section>
      </div>
    </aside>

    <main class="gardia-ai-center" aria-label="Gardia central">
      <div class="gardia-ai-orb-stage">
        <div class="gardia-ai-orb-glow"></div>
      </div>
      <div class="gardia-ai-prompt gardia-center-text">
        <span>Gardia</span>
        <strong>Centro operacional da portaria</strong>
        <p>Monitorando ocorrencias, rondas, alertas e contratos do condominio.</p>
      </div>
    </main>
  `;
}

function renderEvento(evento) {
  return `
    <article class="gardia-ai-event">
      <span class="gardia-ai-event-dot gardia-ai-event-dot--${evento.tipo}"></span>
      <div>
        <strong>${evento.titulo}</strong>
        <p>${evento.descricao}</p>
        <small>${evento.hora}</small>
      </div>
    </article>
  `;
}

function renderChecklist(item) {
  return `
    <article class="gardia-ai-check gardia-ai-check--${item.prioridade || 'normal'}">
      <span>${item.prioridade || 'normal'}</span>
      <p>${item.texto}</p>
    </article>
  `;
}

function renderMensagem(item) {
  const papel = window.gardiaPapel ?? 'Porteiro';

  return `
    <article class="gardia-ai-message gardia-ai-message--${item.remetente === 'porteiro' ? 'operador' : 'gardia'}">
      <span>${item.remetente === 'porteiro' ? papel : 'Gardia'}</span>
      <p>${item.texto}</p>
    </article>
  `;
}

function iconMenu() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
}

function iconGardiaChat() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none"/></svg>';
}

function iconPhoneCall() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"/><path d="M14 2.5a6 6 0 0 1 6 6"/><path d="M14 6a2.5 2.5 0 0 1 2.5 2.5"/></svg>';
}

function iconLightning() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>';
}

function iconClose() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M18 6 6 18M6 6l12 12"/></svg>';
}

function iconMic() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>';
}

function iconSend() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
}
