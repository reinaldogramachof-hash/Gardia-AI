import { create, qs } from '../../utils/dom.js';

export const Toast = {
  success: (msg) => showToast('success', msg),
  error: (msg) => showToast('error', msg),
  warning: (msg) => showToast('warning', msg),
  info: (msg) => showToast('info', msg),
};

const ICONS = {
  success: '<svg class="w-5 h-5 text-status-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
  error: '<svg class="w-5 h-5 text-status-critico" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
  warning: '<svg class="w-5 h-5 text-status-alerta" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
  info: '<svg class="w-5 h-5 text-gardia-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
};

function getContainer() {
  let container = qs('#toast-container');
  if (!container) {
    container = create('div', 'fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(type, msg) {
  const container = getContainer();
  
  if (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  const toast = create('div', 'flex items-center gap-3 bg-surface-900 border border-surface-800 p-4 rounded-gardia shadow-lg min-w-[280px] max-w-sm pointer-events-auto cursor-pointer animate-[slideIn_0.2s_ease-out]');
  toast.innerHTML = `
    <div class="flex-shrink-0">${ICONS[type]}</div>
    <div class="text-sm text-white flex-grow">${msg}</div>
    <div class="absolute bottom-0 left-0 h-1 bg-surface-800 w-full overflow-hidden rounded-b-gardia">
      <div class="h-full bg-current opacity-50 animate-[shrink_4s_linear]" style="color: var(--toast-color-${type})"></div>
    </div>
  `;
  
  const colors = { success: '#34d17a', error: '#ff4757', warning: '#f5c118', info: '#c44ee8' };
  toast.style.setProperty(`--toast-color-${type}`, colors[type]);

  toast.addEventListener('click', () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s';
    setTimeout(() => toast.remove(), 200);
  });

  container.appendChild(toast);

  if (!qs('#toast-styles')) {
    const style = create('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes shrink { from { width: 100%; } to { width: 0%; } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s';
      setTimeout(() => toast.remove(), 200);
    }
  }, 4000);
}
