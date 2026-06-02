const DEFAULT_DESCRIPTION = 'Este módulo está em construção e será ativado em breve.';

function createCard({ icon, title, description = DEFAULT_DESCRIPTION }) {
  const root = document.createElement('section');
  root.className = 'gardia-view-shell gardia-view-page';

  root.innerHTML = `
    <div class="card gardia-view-card">
      <div class="gardia-view-icon" aria-hidden="true">${icon}</div>
      <h1 class="gardia-view-title">${title}</h1>
      <p class="gardia-view-subtitle">${description === 'Em desenvolvimento 🚧' ? DEFAULT_DESCRIPTION : description}</p>
    </div>
  `;

  return root;
}

export function createPlaceholderView(config) {
  return createCard(config);
}

export default createPlaceholderView;
