function createCard({ icon, title, description }) {
  const root = document.createElement('section');
  root.className = 'gardia-view-shell gardia-view-page';

  root.innerHTML = `
    <div class="card gardia-view-card">
      <div class="gardia-view-icon" aria-hidden="true">${icon}</div>
      <h1 class="gardia-view-title">${title}</h1>
      <p class="gardia-view-subtitle">${description}</p>
    </div>
  `;

  return root;
}

export function createPlaceholderView(config) {
  return createCard(config);
}

export default createPlaceholderView;
