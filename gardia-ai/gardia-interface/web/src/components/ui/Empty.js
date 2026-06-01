import { create } from '../../utils/dom.js';

export function Empty({ icon, title, description, action = null }) {
  const el = create('div', 'empty-state');
  
  if (icon) {
    const iconEl = create('div', 'empty-icon');
    iconEl.innerHTML = icon;
    el.appendChild(iconEl);
  }
  
  if (title) {
    const titleEl = create('h3', 'empty-title');
    titleEl.textContent = title;
    el.appendChild(titleEl);
  }
  
  if (description) {
    const descEl = create('p', 'empty-desc');
    descEl.textContent = description;
    el.appendChild(descEl);
  }
  
  if (action && action.label && action.onClick) {
    const btnContainer = create('div', 'mt-4');
    const btn = create('button', 'btn-primary');
    btn.textContent = action.label;
    btn.addEventListener('click', action.onClick);
    btnContainer.appendChild(btn);
    el.appendChild(btnContainer);
  }
  
  return el;
}
