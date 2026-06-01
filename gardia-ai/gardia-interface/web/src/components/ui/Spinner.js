import { create } from '../../utils/dom.js';

export function Spinner({ size = 'md' } = {}) {
  const sizes = { sm: '16px', md: '24px', lg: '40px' };
  const dim = sizes[size] || sizes.md;

  const el = create('div', 'inline-flex text-gardia-500');
  el.style.width = dim;
  el.style.height = dim;
  
  el.innerHTML = `
    <svg class="animate-spin w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  
  return el;
}
