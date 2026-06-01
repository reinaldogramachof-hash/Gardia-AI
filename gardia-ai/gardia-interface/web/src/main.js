import "./index.css";
import db from "./db/schema.js";
import { applyMigrations } from "./db/migrations.js";
import router from "./router.js";
import { iniciarOrbeGardia } from "./utils/gardiaOrb.js";
import { GardiaFloat } from "./components/GardiaFloat.js";
import { logger } from "./utils/logger.js";

const appRoot = document.querySelector("#app");
bootstrap();

async function bootstrap() {
  applyMigrations(db);
  try { await db.open(); } catch (e) { logger.error("db", e); }
  renderShell();
  const canvas = document.querySelector("#gardia-orb-canvas");
  if (canvas) iniciarOrbeGardia(canvas, () => "inativo");
  const floatEl = GardiaFloat();
  document.body.appendChild(floatEl);
  router.onRoute(({ route }) => renderRoute(route));
  const rota = router.getCurrentRoute();
  if (!rota || rota === "/") router.push("/dashboard");
}

function renderShell() {
  const orb = document.createElement("canvas");
  orb.id = "gardia-orb-canvas";
  orb.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0";
  const shell = document.createElement("div");
  shell.id = "app-shell";
  shell.style.cssText = "display:flex;min-height:100vh;background:#020817;position:relative;z-index:1";
  shell.setAttribute("data-ambiente", "operacional");
  const sidebar = document.createElement("div");
  sidebar.id = "app-sidebar";
  sidebar.style.cssText = "width:260px;flex-shrink:0";
  const main = document.createElement("main");
  main.id = "app-content";
  main.style.cssText = "flex:1;min-height:100vh;position:relative;z-index:1";
  shell.appendChild(sidebar);
  shell.appendChild(main);
  appRoot.appendChild(shell);
  document.body.appendChild(orb);
}

async function renderRoute(route) {
  const el = document.querySelector("#app-content");
  if (!el) return;
  el.innerHTML = "";
  try {
    const { renderSidebar } = await import("./components/layout/Sidebar.js");
    const sidebar = document.querySelector("#app-sidebar");
    if (sidebar) sidebar.replaceWith(renderSidebar(route));
  } catch (e) { logger.error("sidebar", e); }
  try {
    if (route === "/dashboard" || route === "/") {
      const { Dashboard } = await import("./views/Dashboard.js");
      el.appendChild(Dashboard());
    }
  } catch (e) { logger.error("view", e); }
}