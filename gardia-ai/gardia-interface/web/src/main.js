import "./index.css";
import db from "./db/schema.js";
import { applyMigrations } from "./db/migrations.js";
import { seedSplendorPatrianni } from "./db/seed.js";
import router from "./router.js";
import { iniciarOrbeGardia } from "./utils/gardiaOrb.js";
import { GardiaFloat } from "./components/GardiaFloat.js";
import { logger } from "./utils/logger.js";

const appRoot = document.querySelector("#app");
let gardiaFloatEl = null;
window.gardiaStatusVoz = window.gardiaStatusVoz || "inativo";
bootstrap();

async function bootstrap() {
  applyMigrations(db);
  try { 
    await db.open(); 
    await seedSplendorPatrianni();
  } catch (e) { logger.error("db", e); }
  renderShell();
  const canvas = document.querySelector("#gardia-orb-canvas");
  if (canvas) iniciarOrbeGardia(canvas, () => window.gardiaStatusVoz || "inativo");
  gardiaFloatEl = GardiaFloat();
  document.body.appendChild(gardiaFloatEl);
  router.onRoute(({ route }) => renderRoute(route));
  const rota = router.getCurrentRoute();
  if (!rota || rota === "/") router.push("/dashboard");
}

function renderShell() {
  const orb = document.createElement("canvas");
  orb.id = "gardia-orb-canvas";
  orb.className = "gardia-ai-orb-bg";
  const shell = document.createElement("div");
  shell.id = "app-shell";
  shell.className = "gardia-ai-shell";
  shell.setAttribute("data-ambiente", "operacional");
  const sidebar = document.createElement("div");
  sidebar.id = "app-sidebar-host";
  sidebar.className = "gardia-ai-sidebar-host";
  const main = document.createElement("main");
  main.id = "app-content";
  main.className = "gardia-ai-content";
  shell.appendChild(sidebar);
  shell.appendChild(main);
  appRoot.appendChild(shell);
  document.body.appendChild(orb);
}

async function renderRoute(route) {
  const el = document.querySelector("#app-content");
  if (!el) return;
  el.innerHTML = "";
  const sidebarHost = document.querySelector("#app-sidebar-host");
  if (sidebarHost) sidebarHost.innerHTML = "";

  document.body.classList.toggle("gardia-ai-dashboard-active", route === "/dashboard" || route === "/");
  gardiaFloatEl?.classList.toggle("hidden", route === "/dashboard" || route === "/");

  const { renderSidebar } = await import("./components/layout/Sidebar.js");

  try {
    if (route !== "/dashboard" && route !== "/" && sidebarHost) {
      sidebarHost.appendChild(renderSidebar(route));
    }
  } catch (e) { logger.error("sidebar", e); }

  try {
    if (route === "/dashboard" || route === "/") {
      const { Dashboard } = await import("./views/Dashboard.js");
      const dashboard = Dashboard();
      el.appendChild(dashboard);
      dashboard.querySelector("#gardia-ai-sidebar-slot")?.appendChild(renderSidebar(route));
    }
  } catch (e) { logger.error("view", e); }
}
