const ROUTE_PATTERNS = [
  '/',
  '/onboarding',
  '/dashboard',
  '/condominio/list',
  '/condominio/novo',
  '/condominio/:id',
  '/condominio/:id/ficha',
  '/profissional/list',
  '/ronda/list',
  '/cobertura/nova',
  '/cobertura/:id/briefing',
  '/cobertura/:id/status',
  '/ocorrencia/nova',
  '/ocorrencia/list',
  '/sindico/dashboard',
  '/sindico/ocorrencias',
  '/sindico/compliance',
  '/sindico/comunicado',
  '/admin/dashboard',
  '/admin/reservas',
  '/admin/documentos',
  '/admin/solicitacoes',
  '/relatorio/turno/:coberturaId',
];

function normalizeRoute(route) {
  const value = String(route || '/').trim();
  const withPrefix = value.startsWith('/') ? value : `/${value}`;
  return withPrefix.replace(/\/+$/g, '') || '/';
}

function splitRoute(route) {
  return normalizeRoute(route).split('/').filter(Boolean);
}

function matchPattern(pattern, route) {
  const patternParts = splitRoute(pattern);
  const routeParts = splitRoute(route);

  if (patternParts.length !== routeParts.length) return false;

  return patternParts.every((part, index) => part.startsWith(':') || part === routeParts[index]);
}

function extractParams(pattern, route) {
  const params = {};
  const patternParts = splitRoute(pattern);
  const routeParts = splitRoute(route);

  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(routeParts[index] || '');
    }
  });

  return params;
}

export function getCurrentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  return normalizeRoute(hash || '/');
}

export function getParams() {
  const currentRoute = getCurrentRoute();
  const matchedPattern = ROUTE_PATTERNS.find((pattern) => matchPattern(pattern, currentRoute));
  return matchedPattern ? extractParams(matchedPattern, currentRoute) : {};
}

export function push(route) {
  const nextRoute = normalizeRoute(route);
  const nextHash = `#${nextRoute}`;

  if (window.location.hash === nextHash) {
    window.dispatchEvent(new CustomEvent('routechange', { detail: { route: nextRoute, params: getParams() } }));
    return;
  }

  window.location.hash = nextHash;
  window.dispatchEvent(new CustomEvent('routechange', { detail: { route: nextRoute, params: getParams() } }));
}

export function back() {
  window.history.back();
}

export function onRoute(callback) {
  const notify = () => {
    const route = getCurrentRoute();
    callback({ route, params: getParams() });
  };

  const customHandler = () => notify();
  const popstateHandler = () => notify();
  const hashchangeHandler = () => notify();

  window.addEventListener('routechange', customHandler);
  window.addEventListener('popstate', popstateHandler);
  window.addEventListener('hashchange', hashchangeHandler);

  notify();

  return () => {
    window.removeEventListener('routechange', customHandler);
    window.removeEventListener('popstate', popstateHandler);
    window.removeEventListener('hashchange', hashchangeHandler);
  };
}

export const router = {
  push,
  back,
  onRoute,
  getParams,
  getCurrentRoute,
};

export default router;