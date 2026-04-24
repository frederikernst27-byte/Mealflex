/**
 * Frontend-Logik - Öffentliche Website
 * Rendert die Speisekarte, behandelt Filter und das Detail-Modal.
 */

(function () {
  const menuGrid = document.getElementById('menuGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modal = document.getElementById('dishModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const statusBanner = document.getElementById('statusBanner');

  let currentCategory = 'all';

  function renderStatus() {
    const settings = DataStore.getSettings();
    const statusMap = {
      open: { text: 'Jetzt geöffnet', cls: 'open' },
      closed: { text: 'Aktuell geschlossen', cls: '' },
      permanently_closed: { text: 'Dauerhaft geschlossen', cls: '' },
    };
    const info = statusMap[settings.status] || statusMap.closed;
    statusBanner.textContent = info.text;
    statusBanner.className = 'status-banner ' + info.cls;
  }

  function renderMenu() {
    const dishes = DataStore.getDishes().filter(d => d.available);
    const filtered = currentCategory === 'all'
      ? dishes
      : dishes.filter(d => d.category === currentCategory);

    if (filtered.length === 0) {
      menuGrid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color:#6b6b6b;">In dieser Kategorie sind keine Speisen verfügbar.</p>';
      return;
    }

    menuGrid.innerHTML = filtered.map(dishCardHtml).join('');

    menuGrid.querySelectorAll('.dish-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const dish = DataStore.getDishes().find(d => d.id === id);
        if (dish) openModal(dish);
      });
    });
  }

  function dishCardHtml(dish) {
    const imageContent = dish.image
      ? `<img src="${escapeHtml(dish.image)}" alt="${escapeHtml(dish.name)}" />`
      : `<span>${escapeHtml(dish.emoji || '🍽')}</span>`;

    return `
      <article class="dish-card" data-id="${escapeHtml(dish.id)}">
        <div class="dish-image">${imageContent}</div>
        <div class="dish-body">
          <div class="dish-header">
            <h3 class="dish-name">${escapeHtml(dish.name)}</h3>
            <span class="dish-price">${formatPrice(dish.price)}</span>
          </div>
          <p class="dish-description">${escapeHtml(dish.description || '')}</p>
          <span class="dish-category">${escapeHtml(CATEGORY_LABELS[dish.category] || dish.category)}</span>
        </div>
      </article>
    `;
  }

  function openModal(dish) {
    const imageContent = dish.image
      ? `<img src="${escapeHtml(dish.image)}" alt="${escapeHtml(dish.name)}" />`
      : `<span>${escapeHtml(dish.emoji || '🍽')}</span>`;

    modalBody.innerHTML = `
      <div class="dish-image">${imageContent}</div>
      <h2>${escapeHtml(dish.name)}</h2>
      <span class="dish-price">${formatPrice(dish.price)}</span>
      <p style="margin-top:1rem; color:#6b6b6b;">${escapeHtml(dish.description || 'Keine Beschreibung verfügbar.')}</p>
      <span class="dish-category">${escapeHtml(CATEGORY_LABELS[dish.category] || dish.category)}</span>
    `;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderMenu();
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  renderStatus();
  renderMenu();
})();
