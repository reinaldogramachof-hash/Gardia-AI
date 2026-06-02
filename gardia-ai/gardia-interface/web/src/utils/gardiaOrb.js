export function iniciarOrbeGardia(canvas, obterStatus = () => 'inativo') {
  const ctx = canvas?.getContext?.('2d');
  if (!ctx) return criarControleVazio();

  const particulas = criarParticulas(920);
  let frameId = 0;
  let parado = false;
  let inicio = performance.now();
  const dinamica = {
    offsetX: 0,
    offsetY: 0,
    layoutOffsetX: 0,
    layoutOffsetY: 0,
    scale: 1,
    pulse: 0,
    pulseStart: 0,
  };

  const pulsar = () => {
    dinamica.pulseStart = performance.now();
  };

  window.addEventListener('gardia:pulse', pulsar);

  const desenhar = (agora) => {
    if (parado) return;

    prepararCanvas(canvas);
    atualizarDinamica(dinamica, canvas, agora);
    renderizar(ctx, canvas, particulas, agora - inicio, obterStatus(), dinamica);
    frameId = requestAnimationFrame(desenhar);
  };

  prepararCanvas(canvas);
  frameId = requestAnimationFrame(desenhar);

  return {
    parar() {
      parado = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('gardia:pulse', pulsar);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

function criarParticulas(total) {
  return Array.from({ length: total }, (_, index) => {
    const banda = index / total;
    return {
      angulo: Math.random() * Math.PI * 2,
      fase: Math.random() * Math.PI * 2,
      raio: 0.64 + Math.random() * 0.3 + banda * 0.05,
      velocidade: 0.00008 + Math.random() * 0.00032,
      tamanho: 0.45 + Math.random() * 1.45,
      opacidade: 0.2 + Math.random() * 0.74,
      camada: Math.random(),
    };
  });
}

function prepararCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
}

function atualizarDinamica(dinamica, canvas, agora) {
  const dpr = window.devicePixelRatio || 1;
  const cursorX = (window.gardiaCursorX ?? 0.5) - 0.5;
  const cursorY = (window.gardiaCursorY ?? 0.5) - 0.5;
  const alvoLayoutX = (window.gardiaOrbOffsetX || 0) * dpr;
  const alvoLayoutY = (window.gardiaOrbOffsetY || 0) * dpr;
  const alvoX = cursorX * 60 * dpr;
  const alvoY = cursorY * 60 * dpr;
  const alvoScale = Number.isFinite(window.gardiaOrbScale) ? window.gardiaOrbScale : 1;

  dinamica.layoutOffsetX += (alvoLayoutX - dinamica.layoutOffsetX) * 0.04;
  dinamica.layoutOffsetY += (alvoLayoutY - dinamica.layoutOffsetY) * 0.04;
  dinamica.offsetX += (alvoX - dinamica.offsetX) * 0.03;
  dinamica.offsetY += (alvoY - dinamica.offsetY) * 0.03;
  dinamica.scale += (alvoScale - dinamica.scale) * 0.05;

  const idadePulso = agora - dinamica.pulseStart;
  dinamica.pulse = idadePulso >= 0 && idadePulso <= 300
    ? Math.sin((idadePulso / 300) * Math.PI)
    : 0;
}

function renderizar(ctx, canvas, particulas, tempo, status, dinamica) {
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2 + dinamica.layoutOffsetX + dinamica.offsetX;
  const cy = height / 2 + dinamica.layoutOffsetY + dinamica.offsetY;
  const base = Math.min(width, height) * 0.34 * dinamica.scale * (1 + dinamica.pulse * 0.05);
  const estado = estadoVisual(status);
  const pulso = (Math.sin(tempo * estado.pulso) + 1) / 2;
  const respiracao = 1 + pulso * estado.expansao;

  ctx.clearRect(0, 0, width, height);
  desenharBrilho(ctx, cx, cy, base, estado, pulso + dinamica.pulse);
  desenharParticulas(ctx, cx, cy, base, particulas, tempo, estado, respiracao);
  if (estado.ondas) desenharOndas(ctx, cx, cy, base, tempo, estado);
}

function estadoVisual(status) {
  const mapa = {
    inativo: { velocidade: 0.55, expansao: 0.045, pulso: 0.0014, brilho: 0.68, ruido: 0.1, raio: 1, tamanho: 1, cor: [125, 211, 252] },
    ouvindo: { velocidade: 0.85, expansao: 0.08, pulso: 0.0024, brilho: 0.9, ruido: 0.14, raio: 0.86, tamanho: 1.08, cor: [125, 211, 252] },
    processando: { velocidade: 1.9, expansao: 0.13, pulso: 0.0036, brilho: 0.82, ruido: 0.3, raio: 1.02, tamanho: 1.18, cor: [14, 165, 233] },
    respondendo: { velocidade: 1.3, expansao: 0.1, pulso: 0.003, brilho: 0.88, ruido: 0.18, raio: 1.06, tamanho: 1.08, ondas: true, cor: [186, 230, 253] },
    falando: { velocidade: 1.35, expansao: 0.14, pulso: 0.004, brilho: 0.76, ruido: 0.16, raio: 1.08, tamanho: 1.08, ondas: true, cor: [186, 230, 253] },
    indisponivel: { velocidade: 0.28, expansao: 0.02, pulso: 0.0008, brilho: 0.34, ruido: 0.06, raio: 0.96, tamanho: 0.9, cor: [148, 163, 184] },
  };

  return mapa[status] || mapa.inativo;
}

function desenharBrilho(ctx, cx, cy, base, estado, pulso) {
  const [r, g, b] = estado.cor;
  const grad = ctx.createRadialGradient(cx, cy, base * 0.16, cx, cy, base * 1.62);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.12 + estado.brilho * 0.1})`);
  grad.addColorStop(0.44, `rgba(${r}, ${g}, ${b}, ${0.08 + pulso * 0.08})`);
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, base * 1.72, 0, Math.PI * 2);
  ctx.fill();
}

function desenharMembranas(ctx, cx, cy, base, tempo, estado, respiracao) {
  const [r, g, b] = estado.cor;
  ctx.lineCap = 'round';

  for (let camada = 0; camada < 4; camada += 1) {
    const pontos = 160;
    const raioBase = base * (0.82 + camada * 0.12) * respiracao;
    ctx.beginPath();

    for (let i = 0; i <= pontos; i += 1) {
      const t = i / pontos;
      const a = t * Math.PI * 2;
      const ondaA = Math.sin(a * 3 + tempo * 0.0012 * estado.velocidade + camada);
      const ondaB = Math.cos(a * 5 - tempo * 0.0008 * estado.velocidade);
      const ruido = (ondaA * 0.06 + ondaB * 0.04) * base * (0.8 + estado.ruido);
      const raio = raioBase + ruido;
      const x = cx + Math.cos(a) * raio * (1 + camada * 0.012);
      const y = cy + Math.sin(a) * raio * (0.9 + camada * 0.018);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.18 + camada * 0.07})`;
    ctx.lineWidth = Math.max(1, base * (0.006 + camada * 0.0015));
    ctx.stroke();
  }
}

function desenharParticulas(ctx, cx, cy, base, particulas, tempo, estado, respiracao) {
  const [r, g, b] = estado.cor;
  const giro = tempo * 0.00016 * estado.velocidade;

  for (const p of particulas) {
    const a = p.angulo + giro + tempo * p.velocidade * estado.velocidade;
    const membrana = Math.sin(a * 4 + p.fase + tempo * 0.001 * estado.velocidade) * estado.ruido;
    const raio = base * (p.raio + membrana) * respiracao * estado.raio;
    const achatamento = 0.86 + p.camada * 0.16;
    const x = cx + Math.cos(a) * raio;
    const y = cy + Math.sin(a) * raio * achatamento;
    const profundidade = 0.45 + Math.sin(a + p.fase) * 0.35 + p.camada * 0.25;
    const alpha = Math.max(0.05, Math.min(1, p.opacidade * profundidade * estado.brilho));
    const tamanho = p.tamanho * (0.75 + profundidade) * estado.tamanho;

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, tamanho, 0, Math.PI * 2);
    ctx.fill();
  }
}

function desenharOndas(ctx, cx, cy, base, tempo, estado) {
  const [r, g, b] = estado.cor;

  for (let i = 0; i < 3; i += 1) {
    const progresso = ((tempo * 0.00045 + i / 3) % 1);
    const raio = base * (0.35 + progresso * 1.25);
    const alpha = (1 - progresso) * 0.18;

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = Math.max(1, base * 0.006);
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function desenharNucleoEscuro(ctx, cx, cy, base, estado, pulso) {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * (0.56 + pulso * 0.035));
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.94)');
  grad.addColorStop(0.52, 'rgba(2, 6, 23, 0.84)');
  grad.addColorStop(0.84, 'rgba(2, 6, 23, 0.24)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, base * (0.62 + estado.expansao), 0, Math.PI * 2);
  ctx.fill();
}

function criarControleVazio() {
  return { parar() {} };
}
