import "./index.css";
import db from "./db/schema.js";
import { applyMigrations } from "./db/migrations.js";
import { seedSplendorPatrianni } from "./db/seed.js";
import router from "./router.js";
import { iniciarOrbeGardia } from "./utils/gardiaOrb.js";
import { GardiaFloat } from "./components/GardiaFloat.js";
import { logger } from "./utils/logger.js";
import createPlaceholderView from "./views/PlaceholderView.js";

const appRoot = document.querySelector("#app");
let gardiaFloatEl = null;
window.gardiaStatus = window.gardiaStatus || "inativo";
window.gardiaStatusVoz = window.gardiaStatusVoz || "inativo";
window.gardiaCursorX = window.gardiaCursorX ?? 0.5;
window.gardiaCursorY = window.gardiaCursorY ?? 0.5;
window.gardiaOrbScale = window.gardiaOrbScale ?? 1;

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

  requestAnimationFrame(() => {
    console.log("Canvas:", canvas.offsetWidth, canvas.offsetHeight);
    iniciarOrbeGardia(canvas, () => window.gardiaStatus || window.gardiaStatusVoz || "inativo");
  });

  gardiaFloatEl = GardiaFloat();
  document.body.appendChild(gardiaFloatEl);

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

  const main = document.createElement("main");
  main.id = "app-content";
  main.className = "gardia-ai-content";

  shell.appendChild(main);
  appRoot.appendChild(shell);

  return canvas;
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

  document.body.classList.toggle("gardia-ai-dashboard-active", route === "/dashboard");
  gardiaFloatEl?.classList.toggle("hidden", route === "/dashboard");

  const viewRoot = await loadView(route);
  if (viewRoot) {
    el.appendChild(viewRoot);
  }
}

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
