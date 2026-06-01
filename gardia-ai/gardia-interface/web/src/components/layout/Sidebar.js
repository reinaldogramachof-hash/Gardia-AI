const grupos = [
  {
    titulo: 'Turno',
    itens: [
      { rota: '/dashboard', label: 'Dashboard', icon: iconGrid() },
      { rota: '/ocorrencia/list', label: 'Ocorrencias', icon: iconAlert() },
      { rota: '/ronda/list', label: 'Rondas', icon: iconRoute() },
      { rota: '/acesso', label: 'Acesso', icon: iconUser() },
    ],
  },
  {
    titulo: 'Sistema',
    itens: [
      { rota: '/gardia', label: 'Sistemas', icon: iconSpark() },
    ],
  },
];

export function renderSidebar(routeAtual) {
  const aside = document.createElement('aside');
  aside.id = 'app-sidebar';
  aside.className = 'gardia-ai-sidebar';
  aside.setAttribute('aria-label', 'Menu principal da Gardia');

  aside.innerHTML = `
    <nav class="gardia-ai-sidebar-nav">
      ${grupos.map((grupo) => `
        <section class="gardia-ai-sidebar-group">
          <p>${grupo.titulo}</p>
          ${grupo.itens.map((item) => botaoNav(item, routeAtual)).join('')}
        </section>
      `).join('')}
    </nav>
  `;

  aside.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', async () => {
      const routerModule = await import('../../router.js');
      (routerModule.default || routerModule).push(button.dataset.route);
      window.dispatchEvent(new CustomEvent('gardia-ai-close-left-panel'));
    });
  });

  return aside;
}

function botaoNav(item, routeAtual) {
  const ativo = routeAtual === item.rota || (routeAtual === '/' && item.rota === '/dashboard');

  return `
    <button class="gardia-ai-sidebar-item${ativo ? ' gardia-ai-sidebar-item--active' : ''}" data-route="${item.rota}" type="button">
      ${item.icon}
      <span>${item.label}</span>
    </button>
  `;
}

function iconGrid() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>';
}

function iconAlert() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 9v4M12 17h.01"/><path d="M10.3 4.4 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.4a2 2 0 0 0-3.4 0Z"/></svg>';
}

function iconRoute() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 4v16M18 4v16M6 8h12M6 16h12"/><path d="m9 11 3-3 3 3M15 13l-3 3-3-3"/></svg>';
}

function iconUser() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>';
}

function iconSpark() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16Z"/></svg>';
}
