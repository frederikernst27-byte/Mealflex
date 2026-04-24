/**
 * Admin-Panel-Logik
 * Authentifizierung, CRUD auf Speisen, Bild-Upload (base64), Einstellungen.
 */

(function () {
  // Elements
  const loginScreen = document.getElementById('loginScreen');
  const adminContainer = document.getElementById('adminContainer');
  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  const navBtns = document.querySelectorAll('.admin-nav-btn');
  const views = document.querySelectorAll('.admin-view');

  const dishesTableBody = document.getElementById('dishesTableBody');
  const addDishBtn = document.getElementById('addDishBtn');
  const searchInput = document.getElementById('searchInput');
  const filterCategory = document.getElementById('filterCategory');

  const dishEditModal = document.getElementById('dishEditModal');
  const dishEditForm = document.getElementById('dishEditForm');
  const dishEditClose = document.getElementById('dishEditClose');
  const dishEditCancel = document.getElementById('dishEditCancel');
  const dishEditTitle = document.getElementById('dishEditTitle');

  const dishIdInput = document.getElementById('dishId');
  const dishNameInput = document.getElementById('dishName');
  const dishCategoryInput = document.getElementById('dishCategory');
  const dishDescInput = document.getElementById('dishDescription');
  const dishPriceInput = document.getElementById('dishPrice');
  const dishEmojiInput = document.getElementById('dishEmoji');
  const dishImageInput = document.getElementById('dishImage');
  const dishAvailableInput = document.getElementById('dishAvailable');
  const imagePreview = document.getElementById('imagePreview');

  const settingsForm = document.getElementById('settingsForm');
  const restNameInput = document.getElementById('restName');
  const restAddressInput = document.getElementById('restAddress');
  const restPhoneInput = document.getElementById('restPhone');
  const restStatusInput = document.getElementById('restStatus');
  const adminPasswordInput = document.getElementById('adminPassword');
  const resetDataBtn = document.getElementById('resetDataBtn');

  const categoryStats = document.getElementById('categoryStats');
  const toast = document.getElementById('toast');

  let currentImageData = null;

  // ---------- Auth ----------
  function checkAuth() {
    if (DataStore.isAuthenticated()) {
      showAdmin();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    loginScreen.style.display = 'flex';
    adminContainer.style.display = 'none';
  }

  function showAdmin() {
    loginScreen.style.display = 'none';
    adminContainer.style.display = 'grid';
    renderAll();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = passwordInput.value;
    if (entered === DataStore.getPassword()) {
      DataStore.setAuthenticated(true);
      loginError.textContent = '';
      passwordInput.value = '';
      showAdmin();
    } else {
      loginError.textContent = 'Falsches Passwort.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    DataStore.setAuthenticated(false);
    showLogin();
  });

  // ---------- Navigation ----------
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.getElementById('view-' + view).classList.add('active');
    });
  });

  // ---------- Speisen-Tabelle ----------
  function renderDishesTable() {
    const search = (searchInput.value || '').toLowerCase().trim();
    const category = filterCategory.value;
    let dishes = DataStore.getDishes();

    if (category !== 'all') {
      dishes = dishes.filter(d => d.category === category);
    }
    if (search) {
      dishes = dishes.filter(d =>
        d.name.toLowerCase().includes(search) ||
        (d.description || '').toLowerCase().includes(search)
      );
    }

    if (dishes.length === 0) {
      dishesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#6b6b6b;">Keine Speisen gefunden.</td></tr>';
      return;
    }

    dishesTableBody.innerHTML = dishes.map(rowHtml).join('');

    dishesTableBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => openDishEditor(btn.dataset.id));
    });
    dishesTableBody.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => deleteDish(btn.dataset.id));
    });
    dishesTableBody.querySelectorAll('[data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', () => toggleAvailable(btn.dataset.id));
    });
  }

  function rowHtml(dish) {
    const imgContent = dish.image
      ? `<img src="${escapeHtml(dish.image)}" alt="" />`
      : `<span>${escapeHtml(dish.emoji || '🍽')}</span>`;

    return `
      <tr>
        <td><div class="table-image">${imgContent}</div></td>
        <td>
          <strong>${escapeHtml(dish.name)}</strong>
          <div style="font-size:0.85rem; color:#6b6b6b; margin-top:0.15rem;">${escapeHtml((dish.description || '').slice(0, 60))}${dish.description && dish.description.length > 60 ? '...' : ''}</div>
        </td>
        <td><span class="badge badge-${escapeHtml(dish.category)}">${escapeHtml(CATEGORY_LABELS[dish.category] || dish.category)}</span></td>
        <td><strong>${formatPrice(dish.price)}</strong></td>
        <td>
          <button class="status-pill" data-action="toggle" data-id="${escapeHtml(dish.id)}" style="background:transparent; border:none; cursor:pointer;">
            <span class="status-dot ${dish.available ? '' : 'off'}"></span>
            ${dish.available ? 'Aktiv' : 'Inaktiv'}
          </button>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${escapeHtml(dish.id)}">Bearbeiten</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(dish.id)}">Löschen</button>
          </div>
        </td>
      </tr>
    `;
  }

  function deleteDish(id) {
    const dish = DataStore.getDishes().find(d => d.id === id);
    if (!dish) return;
    if (!confirm(`Speise "${dish.name}" wirklich löschen?`)) return;
    DataStore.deleteDish(id);
    renderDishesTable();
    renderCategoryStats();
    showToast('Speise gelöscht', 'success');
  }

  function toggleAvailable(id) {
    const dish = DataStore.getDishes().find(d => d.id === id);
    if (!dish) return;
    DataStore.updateDish(id, { available: !dish.available });
    renderDishesTable();
    showToast(`Speise ist jetzt ${!dish.available ? 'aktiv' : 'inaktiv'}`, 'success');
  }

  searchInput.addEventListener('input', renderDishesTable);
  filterCategory.addEventListener('change', renderDishesTable);

  // ---------- Speisen-Editor Modal ----------
  function openDishEditor(id) {
    currentImageData = null;
    imagePreview.innerHTML = '';
    dishImageInput.value = '';

    if (id) {
      const dish = DataStore.getDishes().find(d => d.id === id);
      if (!dish) return;
      dishEditTitle.textContent = 'Speise bearbeiten';
      dishIdInput.value = dish.id;
      dishNameInput.value = dish.name;
      dishCategoryInput.value = dish.category;
      dishDescInput.value = dish.description || '';
      dishPriceInput.value = dish.price;
      dishEmojiInput.value = dish.emoji || '';
      dishAvailableInput.checked = dish.available !== false;
      if (dish.image) {
        currentImageData = dish.image;
        imagePreview.innerHTML = `<img src="${escapeHtml(dish.image)}" alt="" />`;
      }
    } else {
      dishEditTitle.textContent = 'Neue Speise';
      dishIdInput.value = '';
      dishEditForm.reset();
      dishAvailableInput.checked = true;
    }

    dishEditModal.classList.add('active');
  }

  function closeDishEditor() {
    dishEditModal.classList.remove('active');
  }

  addDishBtn.addEventListener('click', () => openDishEditor(null));
  dishEditClose.addEventListener('click', closeDishEditor);
  dishEditCancel.addEventListener('click', closeDishEditor);
  dishEditModal.addEventListener('click', (e) => {
    if (e.target === dishEditModal) closeDishEditor();
  });

  dishImageInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Bild ist zu groß (max. 2 MB)', 'error');
      dishImageInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentImageData = ev.target.result;
      imagePreview.innerHTML = `<img src="${escapeHtml(currentImageData)}" alt="" />`;
    };
    reader.readAsDataURL(file);
  });

  dishEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = dishIdInput.value;
    const data = {
      name: dishNameInput.value.trim(),
      category: dishCategoryInput.value,
      description: dishDescInput.value.trim(),
      price: parseFloat(dishPriceInput.value) || 0,
      emoji: dishEmojiInput.value.trim() || '🍽',
      image: currentImageData,
      available: dishAvailableInput.checked,
    };

    if (!data.name) {
      showToast('Name ist erforderlich', 'error');
      return;
    }

    if (id) {
      DataStore.updateDish(id, data);
      showToast('Speise aktualisiert', 'success');
    } else {
      DataStore.addDish(data);
      showToast('Speise hinzugefügt', 'success');
    }

    closeDishEditor();
    renderDishesTable();
    renderCategoryStats();
  });

  // ---------- Category Stats ----------
  function renderCategoryStats() {
    const dishes = DataStore.getDishes();
    const stats = {};
    Object.keys(CATEGORY_LABELS).forEach(k => { stats[k] = { total: 0, active: 0 }; });

    dishes.forEach(d => {
      if (!stats[d.category]) stats[d.category] = { total: 0, active: 0 };
      stats[d.category].total++;
      if (d.available) stats[d.category].active++;
    });

    categoryStats.innerHTML = Object.keys(stats).map(key => `
      <div class="stat-card">
        <h3>${escapeHtml(CATEGORY_LABELS[key] || key)}</h3>
        <div class="stat-number">${stats[key].total}</div>
        <div class="stat-label">${stats[key].active} aktiv</div>
      </div>
    `).join('');
  }

  // ---------- Settings ----------
  function loadSettings() {
    const s = DataStore.getSettings();
    restNameInput.value = s.name;
    restAddressInput.value = s.address;
    restPhoneInput.value = s.phone;
    restStatusInput.value = s.status;
  }

  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    DataStore.saveSettings({
      name: restNameInput.value.trim(),
      address: restAddressInput.value.trim(),
      phone: restPhoneInput.value.trim(),
      status: restStatusInput.value,
    });

    const newPw = adminPasswordInput.value.trim();
    if (newPw) {
      DataStore.setPassword(newPw);
      adminPasswordInput.value = '';
      showToast('Einstellungen und Passwort gespeichert', 'success');
    } else {
      showToast('Einstellungen gespeichert', 'success');
    }
  });

  resetDataBtn.addEventListener('click', () => {
    if (!confirm('Wirklich alle Speisen auf die Standard-Speisekarte zurücksetzen? Alle Änderungen gehen verloren.')) return;
    DataStore.resetDishes();
    renderDishesTable();
    renderCategoryStats();
    showToast('Speisekarte zurückgesetzt', 'success');
  });

  // ---------- Toast ----------
  let toastTimer;
  function showToast(message, type) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = 'toast show ' + (type || '');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ---------- Init ----------
  function renderAll() {
    renderDishesTable();
    renderCategoryStats();
    loadSettings();
  }

  checkAuth();
})();
