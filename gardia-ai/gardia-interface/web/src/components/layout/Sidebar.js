import { push } from '../../router.js';

const grupos = [
  {
    titulo: 'TURNO',
    itens: [
      { rota: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { rota: '/ocorrencias', label: 'Ocorrências', icon: 'alerta' },
      { rota: '/acesso', label: 'Acesso', icon: 'acesso' },
      { rota: '/rondas', label: 'Rondas', icon: 'rondas' },
      { rota: '/reservas', label: 'Reservas', icon: 'reservas' },
    ],
  },
  {
    titulo: 'OPERAÇÕES',
    itens: [
      { rota: '/zeladoria', label: 'Zeladoria', icon: 'zeladoria' },
      { rota: '/limpeza', label: 'Limpeza', icon: 'limpeza' },
      { rota: '/manutencao', label: 'Manutenção', icon: 'manutencao' },
    ],
  },
  {
    titulo: 'CONSULTAR',
    itens: [
      { rota: '/moradores', label: 'Moradores', icon: 'moradores' },
      { rota: '/prestadores', label: 'Prestadores', icon: 'prestadores' },
      { rota: '/instrucoes', label: 'Instruções', icon: 'instrucoes' },
      { rota: '/emergencias', label: 'Emergências', icon: 'emergencias' },
    ],
  },
  {
    titulo: 'SISTEMAS',
    itens: [
      { rota: '/gardia-ai', label: 'Gardia AI', icon: 'gardia-ai', badge: 'AI' },
      { rota: '/configuracoes', label: 'Configurações', icon: 'configuracoes' },
    ],
  },
];

export function renderSidebar(routeAtual = '/dashboard') {
  const aside = document.createElement('aside');
  const turnoInicio = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  aside.id = 'app-sidebar';
  aside.className = 'gardia-ai-sidebar sidebar--hidden';
  aside.setAttribute('aria-label', 'Navegação principal da Gardia');

  aside.innerHTML = `
    <div class="gardia-ai-sidebar-shell">
      <header class="gardia-ai-sidebar-header">
        <div class="gardia-ai-sidebar-brand">
          <span class="gardia-ai-sidebar-mark" aria-hidden="true">G</span>
          <div class="gardia-ai-sidebar-brand-copy">
            <strong class="gardia-ai-sidebar-title">Gardia AI</strong>
            <span class="gardia-ai-sidebar-online">
              <span class="gardia-ai-sidebar-online-dot" aria-hidden="true"></span>
              Online
            </span>
          </div>
        </div>
      </header>

      <div class="gardia-ai-sidebar-condo" title="Splendor Patrianni">
        Splendor Patrianni
      </div>

      <nav class="gardia-ai-sidebar-nav" aria-label="Módulos">
        ${grupos.map((grupo) => `
          <section class="gardia-ai-sidebar-group" aria-labelledby="grupo-${slug(grupo.titulo)}">
            <p id="grupo-${slug(grupo.titulo)}">${grupo.titulo}</p>
            <div class="gardia-ai-sidebar-items">
              ${grupo.itens.map((item) => renderItem(item, routeAtual)).join('')}
            </div>
          </section>
        `).join('')}
      </nav>

      <div class="gardia-ai-sidebar-turno">
        Turno iniciado às ${turnoInicio}
      </div>
    </div>
  `;

  aside.querySelectorAll('[data-route]').forEach((button) => {
    button.addEventListener('click', () => {
      const rota = button.dataset.route;
      if (rota !== '/dashboard') {
        window.dispatchEvent(new CustomEvent('gardia:center-text-hide'));
      }
      window.dispatchEvent(new CustomEvent('gardia-ai-close-left-panel'));
      push(rota);
    });
  });

  return aside;
}

function renderItem(item, routeAtual) {
  const ativo = routeAtual === item.rota || (routeAtual === '/dashboard' && item.rota === '/dashboard');

  return `
    <button
      class="gardia-ai-sidebar-item${ativo ? ' gardia-ai-sidebar-item--active' : ''}"
      data-route="${item.rota}"
      type="button"
      aria-current="${ativo ? 'page' : 'false'}"
    >
      <span class="gardia-ai-sidebar-item-icon" aria-hidden="true">${icon(item.icon)}</span>
      <span class="gardia-ai-sidebar-item-label">${item.label}</span>
      ${item.badge ? `<span class="gardia-ai-sidebar-badge">${item.badge}</span>` : ''}
    </button>
  `;
}

function icon(name) {
  const common = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

  const map = {
    dashboard: `<svg ${common}><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg>`,
    alerta: `<svg ${common}><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>`,
    acesso: `<svg ${common}><path d="M4 12h16"/><path d="m9 7-5 5 5 5"/><path d="m15 7 5 5-5 5"/></svg>`,
    rondas: `<svg ${common}><circle cx="12" cy="12" r="8"/><path d="M12 4v4"/><path d="M12 16v4"/><path d="M4 12h4"/><path d="M16 12h4"/></svg>`,
    reservas: `<svg ${common}><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M3 10h18"/></svg>`,
    zeladoria: `<svg ${common}><path d="M14.5 4.5a4.5 4.5 0 0 0-6.4 6.3L3 16l5 5 5.2-5.1a4.5 4.5 0 0 0 6.3-6.4l-3.1 3.1-2.5-2.5 3.1-3.1Z"/></svg>`,
    limpeza: `<svg ${common}><path d="M5 12h14"/><path d="M8 12V7a4 4 0 0 1 8 0v5"/><path d="M7 12h10l-1 8H8l-1-8Z"/></svg>`,
    manutencao: `<svg ${common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-6l2-1.2-2-3.4-2.2.8a8 8 0 0 0-5.2-3.1L12 0 8.1 2.1A8 8 0 0 0 2.9 5.2l-2.2-.8-2 3.4 2 1.2a7.8 7.8 0 0 0 0 6l-2 1.2 2 3.4 2.2-.8a8 8 0 0 0 5.2 3.1L12 24l3.9-2.1a8 8 0 0 0 5.2-3.1l2.2.8 2-3.4-2-1.2Z"/></svg>`,
    moradores: `<svg ${common}><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>`,
    prestadores: `<svg ${common}><path d="M4 7h16v10H4z"/><path d="M7 7V5h10v2"/><path d="M8 11h8"/><path d="M8 14h5"/></svg>`,
    instrucoes: `<svg ${common}><path d="M6 4h9l3 3v13H6z"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>`,
    emergencias: `<svg ${common}><path d="M12 2 2 20h20L12 2Z"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>`,
    'gardia-ai': `<svg ${common}><path d="M12 2l3.2 6.5L22 12l-6.8 3.5L12 22l-3.2-6.5L2 12l6.8-3.5L12 2Z"/><path d="M12 8v8"/></svg>`,
    configuracoes: `<svg ${common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 0-6l2-1-2-3.5-2.2.8a8 8 0 0 0-5-2.9L12 0 8.8 2.4a8 8 0 0 0-5 2.9l-2.2-.8-2 3.5 2 1a7.8 7.8 0 0 0 0 6l-2 1 2 3.5 2.2-.8a8 8 0 0 0 5 2.9L12 24l3.2-2.4a8 8 0 0 0 5-2.9l2.2.8 2-3.5-2-1Z"/></svg>`,
  };

  return map[name] || map.dashboard;
}

function slug(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default renderSidebar;
