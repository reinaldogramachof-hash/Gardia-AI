import "./index.css";
import db from "./db/schema.js";
import { applyMigrations } from "./db/migrations.js";
import { seedSplendorPatrianni } from "./db/seed.js";
import router from "./router.js";
import { iniciarOrbeGardia } from "./utils/gardiaOrb.js";
import { logger } from "./utils/logger.js";
import createPlaceholderView from "./views/PlaceholderView.js";

const appRoot = document.querySelector("#app");
window.gardiaStatus = window.gardiaStatus || "inativo";
window.gardiaStatusVoz = window.gardiaStatusVoz || "inativo";
window.gardiaCursorX = window.gardiaCursorX ?? 0.5;
window.gardiaCursorY = window.gardiaCursorY ?? 0.5;
window.gardiaOrbScale = window.gardiaOrbScale ?? 1;
window.gardiaOrbOffsetX = window.gardiaOrbOffsetX ?? 0;
window.gardiaOrbOffsetY = window.gardiaOrbOffsetY ?? 0;

const viewLoaders = {
  '/dashboard': () => import("./views/Dashboard.js"),
  '/ocorrencias': () => import("./views/Ocorrencias.js"),
  '/acesso': () => import("./views/Acesso.js"),
  '/rondas': () => import("./views/Rondas.js"),
  '/reservas': () => import("./views/Reservas.js"),
  '/zeladoria': () => import("./views/Zeladoria.js"),
  '/limpeza': () => import("./views/Limpeza.js"),
  '/manutencao': () => import("./views/Manutencao.js"),
  '/moradores': () => import("./views/Moradores.js"),
  '/prestadores': () => import("./views/Prestadores.js"),
  '/instrucoes': () => import("./views/Instrucoes.js"),
  '/emergencias': () => import("./views/Emergencias.js"),
  '/gardia-ai': () => import("./views/GardiaAI.js"),
  '/configuracoes': () => import("./views/Configuracoes.js"),
  '/visitantes': () => import("./views/Visitantes.js"),
  '/cameras': () => import("./views/Cameras.js"),
};

bootstrap();

async function bootstrap() {
  applyMigrations(db);
  try {
    await db.open();
    await seedSplendorPatrianni();
  } catch (e) {
    logger.error("db", e);
  }

  const canvas = renderShell();

  window.addEventListener("mousemove", (e) => {
    window.gardiaCursorX = e.clientX / window.innerWidth;
    window.gardiaCursorY = e.clientY / window.innerHeight;
  });
  window.addEventListener("resize", () => aplicarModoVisual(router.getCurrentRoute()));
  registrarAtalhoVoz();

  requestAnimationFrame(() => {
    console.log("Canvas:", canvas.offsetWidth, canvas.offsetHeight);
    iniciarOrbeGardia(canvas, () => window.gardiaStatus || window.gardiaStatusVoz || "inativo");
  });

  router.onRoute(({ route }) => renderRoute(route));

  const rawHash = window.location.hash.replace(/^#/, '');
  if (!rawHash) {
    router.push("/dashboard");
  } else if (router.resolveRoute(rawHash) !== rawHash) {
    router.push(router.resolveRoute(rawHash));
  }
}

function renderShell() {
  const canvas = document.createElement("canvas");
  canvas.id = "gardia-orb-canvas";
  canvas.className = "gardia-ai-orb-bg";
  canvas.style.cssText = [
    "position:fixed",
    "inset:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    "z-index:0"
  ].join(";");
  document.body.appendChild(canvas);

  const shell = document.createElement("div");
  shell.id = "app-shell";
  shell.className = "gardia-ai-shell";
  shell.setAttribute("data-ambiente", "operacional");

  const zonaOrbe = document.createElement("div");
  zonaOrbe.className = "gardia-zona-orbe";

  const main = document.createElement("main");
  main.id = "app-content";
  main.className = "gardia-ai-content";

  shell.appendChild(zonaOrbe);
  shell.appendChild(renderVoiceShortcut());
  shell.appendChild(main);
  appRoot.appendChild(shell);

  return canvas;
}

function renderVoiceShortcut() {
  const shortcut = document.createElement("div");
  shortcut.className = "gardia-voice-shortcut";
  shortcut.setAttribute("aria-label", "Atalho de voz");
  shortcut.innerHTML = `
    <button id="gardia-voice-shortcut-btn" class="gardia-voice-shortcut-btn" type="button" aria-label="Pressione espaco para falar">
      <span class="gardia-voice-icon gardia-voice-icon--mic">${iconMic()}</span>
      <span class="gardia-voice-icon gardia-voice-icon--wave" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </button>
    <span class="gardia-voice-hint">pressione espaco para falar</span>
    <span id="gardia-turno-clock" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; line-height: 1.2; color: rgba(148,163,184,0.35);"></span>
  `;

  const clock = shortcut.querySelector("#gardia-turno-clock");
  const updateClock = () => {
    if (!clock) return;
    clock.textContent = `${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · Turno ativo`;
  };
  updateClock();
  window.setInterval(updateClock, 60000);

  shortcut.querySelector("#gardia-voice-shortcut-btn")?.addEventListener("click", () => {
    if (window._gardiaRec) {
      pararReconhecimentoVoz();
    } else {
      iniciarReconhecimentoVoz();
    }
  });

  return shortcut;
}

function iconMic() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>';
}

async function renderRoute(route) {
  const el = document.querySelector("#app-content");
  if (!el) return;

  const previousView = el.firstElementChild;
  if (previousView && typeof previousView._cleanup === "function") {
    try {
      previousView._cleanup();
    } catch (e) {
      logger.error("view-cleanup", e);
    }
  }

  el.innerHTML = "";

  aplicarModoVisual(route);

  const viewRoot = await loadView(route);
  if (viewRoot) {
    if (route === "/dashboard") {
      el.appendChild(viewRoot);
    } else {
      el.appendChild(renderModuleShell(route, viewRoot));
    }
  }
}

function aplicarModoVisual(route) {
  const isDashboard = route === "/dashboard";
  const zonaOrbe = document.querySelector(".gardia-zona-orbe");

  document.body.classList.toggle("gardia-ai-dashboard-active", isDashboard);
  document.body.classList.toggle("gardia-ai-module-active", !isDashboard);
  zonaOrbe?.classList.toggle("gardia-zona-orbe--ativa", !isDashboard);

  if (isDashboard) {
    window.gardiaOrbScale = 1;
    window.gardiaOrbOffsetX = 0;
    window.gardiaOrbOffsetY = 0;
    return;
  }

  window.gardiaOrbScale = 0.45;
  window.gardiaOrbOffsetX = -(window.innerWidth / 2 - 160);
  window.gardiaOrbOffsetY = -30;
}

function renderModuleShell(route, viewRoot) {
  const shell = document.createElement("section");
  shell.className = "gardia-module-shell";

  const meta = getModuleMeta(route);
  shell.innerHTML = `
    <header class="gardia-module-topbar">
      <div class="gardia-module-title">
        <span class="gardia-module-icon" aria-hidden="true">${meta.icon}</span>
        <strong>${meta.title}</strong>
      </div>
      <button class="gardia-module-back" type="button">
        ${iconBack()}
        <span>Voltar</span>
      </button>
    </header>
    <div class="gardia-module-content"></div>
  `;

  shell.querySelector(".gardia-module-back")?.addEventListener("click", () => router.push("/dashboard"));
  shell.querySelector(".gardia-module-content")?.appendChild(viewRoot);

  return shell;
}

function iconBack() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M21 12H9"/></svg>';
}

function getModuleMeta(route) {
  const map = {
    "/ocorrencias": { icon: "⚠", title: "Ocorrências" },
    "/acesso": { icon: "↔", title: "Acesso" },
    "/rondas": { icon: "◎", title: "Rondas" },
    "/reservas": { icon: "☰", title: "Reservas" },
    "/zeladoria": { icon: "🔧", title: "Zeladoria" },
    "/limpeza": { icon: "✦", title: "Limpeza" },
    "/manutencao": { icon: "⚙", title: "Manutenção" },
    "/moradores": { icon: "👤", title: "Moradores" },
    "/prestadores": { icon: "🔨", title: "Prestadores" },
    "/instrucoes": { icon: "☑", title: "Instruções" },
    "/emergencias": { icon: "🚨", title: "Emergências" },
    "/gardia-ai": { icon: "✦", title: "Gardia AI" },
    "/configuracoes": { icon: "⚙", title: "Configurações" },
  };

  return map[route] || { icon: "•", title: formatRouteTitle(route) };
}

function registrarAtalhoVoz() {
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (e.code !== "Space" || tag === "INPUT" || tag === "TEXTAREA" || window._gardiaRec) return;

    e.preventDefault();
    iniciarReconhecimentoVoz();
  });

  document.addEventListener("keyup", (e) => {
    if (e.code !== "Space") return;
    pararReconhecimentoVoz();
  });
}

function iniciarReconhecimentoVoz() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;

  const rec = new SR();
  rec.lang = "pt-BR";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  window._gardiaRec = rec;
  window.gardiaStatus = "ouvindo";
  document.body.classList.add("gardia-voice-active");

  rec.onresult = (event) => {
    const texto = event.results?.[0]?.[0]?.transcript;
    if (texto) {
      window.dispatchEvent(new CustomEvent("gardia:voz", { detail: { texto } }));
    }
  };

  rec.onend = () => {
    window._gardiaRec = null;
    window.gardiaStatus = "inativo";
    document.body.classList.remove("gardia-voice-active");
  };

  try {
    rec.start();
  } catch (e) {
    window._gardiaRec = null;
    window.gardiaStatus = "inativo";
    document.body.classList.remove("gardia-voice-active");
    logger.warn("voice-shortcut", e);
  }
}

function pararReconhecimentoVoz() {
  if (!window._gardiaRec) return;

  window.gardiaStatus = "processando";
  document.body.classList.remove("gardia-voice-active");
  window._gardiaRec.stop();
}

window.iniciarReconhecimentoVoz = iniciarReconhecimentoVoz;
window.pararReconhecimentoVoz = pararReconhecimentoVoz;

async function loadView(route) {
  const loader = viewLoaders[route];

  if (!loader) {
    return createPlaceholderView({
      icon: '🚧',
      title: route === '/dashboard' ? 'Dashboard' : formatRouteTitle(route),
      description: 'Em desenvolvimento 🚧',
    });
  }

  try {
    const module = await loader();
    const factory =
      module.default ||
      module.Dashboard ||
      module.Ocorrencias ||
      module.Acesso ||
      module.Rondas ||
      module.Reservas ||
      module.Zeladoria ||
      module.Limpeza ||
      module.Manutencao ||
      module.Moradores ||
      module.Prestadores ||
      module.Instrucoes ||
      module.Emergencias ||
      module.GardiaAI ||
      module.Configuracoes ||
      module.Visitantes ||
      module.Cameras;

    return typeof factory === "function" ? factory() : null;
  } catch (e) {
    logger.error("view", e);
    return null;
  }
}

function formatRouteTitle(route) {
  const value = String(route || '')
    .split('/')
    .filter(Boolean)
    .pop();

  if (!value) return 'Em desenvolvimento';

  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
