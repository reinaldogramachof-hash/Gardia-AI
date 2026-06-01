import { create, qs } from '../../utils/dom.js';

export const Modal = {
  open,
  close,
  confirm
};

function getOverlay() {
  let overlay = qs('#modal-overlay');
  if (!overlay) {
    overlay = create('div', 'fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 opacity-0 transition-opacity duration-150');
    overlay.id = 'modal-overlay';
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && qs('#modal-overlay')) close();
    });

    document.body.appendChild(overlay);
  }
  return overlay;
}

function open(conteudo) {
  const overlay = getOverlay();
  overlay.innerHTML = '';
  
  const container = create('div', 'w-full max-w-sm bg-surface-900 rounded-gardia p-6 scale-95 transition-transform duration-150 shadow-xl border border-surface-800');
  container.id = 'modal-container';
  
  if (typeof conteudo === 'string') {
    container.innerHTML = conteudo;
  } else {
    container.appendChild(conteudo);
  }

  overlay.appendChild(container);
  
  const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length) focusable[0].focus();

  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    container.classList.remove('scale-95');
    container.classList.add('scale-100');
  });
}

function close() {
  const overlay = qs('#modal-overlay');
  if (!overlay) return;
  
  const container = qs('#modal-container', overlay);
  if (container) {
    container.classList.remove('scale-100');
    container.classList.add('scale-95');
  }
  overlay.classList.add('opacity-0');
  
  setTimeout(() => {
    overlay.remove();
  }, 150);
}

function confirm(msg) {
  return new Promise((resolve) => {
    const el = create('div');
    
    const title = create('h3', 'text-lg font-medium text-white mb-2');
    title.textContent = 'Confirmação';
    
    const text = create('p', 'text-surface-300 text-sm mb-6');
    text.textContent = msg;
    
    const actions = create('div', 'flex justify-end gap-3');
    
    const btnCancel = create('button', 'btn bg-transparent text-surface-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors border border-surface-700 hover:border-surface-500');
    btnCancel.textContent = 'Cancelar';
    btnCancel.addEventListener('click', () => {
      close();
      resolve(false);
    });
    
    const btnConfirm = create('button', 'btn btn-primary px-4 py-2 text-sm');
    btnConfirm.textContent = 'Confirmar';
    btnConfirm.addEventListener('click', () => {
      close();
      resolve(true);
    });
    
    actions.appendChild(btnCancel);
    actions.appendChild(btnConfirm);
    
    el.appendChild(title);
    el.appendChild(text);
    el.appendChild(actions);
    
    open(el);
  });
}
