export const qs = (sel, el = document) => el.querySelector(sel);
export const qsa = (sel, el = document) => [...el.querySelectorAll(sel)];
export const on = (el, ev, fn) => el?.addEventListener(ev, fn);
export const off = (el, ev, fn) => el?.removeEventListener(ev, fn);
export const create = (tag, cls = '') => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
};
