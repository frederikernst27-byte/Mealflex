/**
 * Datenmodul - Standard-Speisekarte & localStorage Zugriff
 * Gemeinsam von index.html und admin.html genutzt.
 */

const STORAGE_KEYS = {
  DISHES: 'castello_dishes',
  SETTINGS: 'castello_settings',
  PASSWORD: 'castello_password',
  AUTH: 'castello_auth',
};

const DEFAULT_PASSWORD = 'castello2026';

const DEFAULT_SETTINGS = {
  name: 'Pizzeria Castello',
  address: 'Bahnhofstraße 42, 46145 Oberhausen',
  phone: '0208 38590901',
  status: 'permanently_closed',
};

const DEFAULT_DISHES = [
  {
    id: 'd1',
    name: 'Pizza Margherita',
    category: 'pizza',
    description: 'Klassiker mit Tomaten, Mozzarella und frischem Basilikum.',
    price: 6.50,
    emoji: '🍕',
    image: null,
    available: true,
  },
  {
    id: 'd2',
    name: 'Pizza Salami',
    category: 'pizza',
    description: 'Mit würziger italienischer Salami und Mozzarella.',
    price: 7.50,
    emoji: '🍕',
    image: null,
    available: true,
  },
  {
    id: 'd3',
    name: 'Pizza Funghi',
    category: 'pizza',
    description: 'Mit frischen Champignons und Mozzarella.',
    price: 7.00,
    emoji: '🍄',
    image: null,
    available: true,
  },
  {
    id: 'd4',
    name: 'Pizza Prosciutto',
    category: 'pizza',
    description: 'Mit gekochtem Schinken und Mozzarella.',
    price: 7.50,
    emoji: '🍕',
    image: null,
    available: true,
  },
  {
    id: 'd5',
    name: 'Pizza Tonno',
    category: 'pizza',
    description: 'Mit Thunfisch, roten Zwiebeln und Mozzarella.',
    price: 8.00,
    emoji: '🐟',
    image: null,
    available: true,
  },
  {
    id: 'd6',
    name: 'Pizza Quattro Stagioni',
    category: 'pizza',
    description: 'Vier Jahreszeiten: Schinken, Pilze, Artischocken, Oliven.',
    price: 9.00,
    emoji: '🍕',
    image: null,
    available: true,
  },
  {
    id: 'd7',
    name: 'Spaghetti Bolognese',
    category: 'pasta',
    description: 'Klassische Pasta mit Hackfleischsoße und Parmesan.',
    price: 7.50,
    emoji: '🍝',
    image: null,
    available: true,
  },
  {
    id: 'd8',
    name: 'Spaghetti Carbonara',
    category: 'pasta',
    description: 'Mit Speck, Eigelb, Pecorino und schwarzem Pfeffer.',
    price: 8.00,
    emoji: '🍝',
    image: null,
    available: true,
  },
  {
    id: 'd9',
    name: 'Penne Arrabbiata',
    category: 'pasta',
    description: 'Scharfe Tomatensauce mit Chili, Knoblauch und Petersilie.',
    price: 7.00,
    emoji: '🌶',
    image: null,
    available: true,
  },
  {
    id: 'd10',
    name: 'Lasagne al Forno',
    category: 'pasta',
    description: 'Hausgemachte Lasagne mit Béchamel und Bolognese.',
    price: 8.50,
    emoji: '🍝',
    image: null,
    available: true,
  },
  {
    id: 'd11',
    name: 'Insalata Mista',
    category: 'salat',
    description: 'Gemischter Salat mit Tomaten, Gurken und Hausdressing.',
    price: 5.50,
    emoji: '🥗',
    image: null,
    available: true,
  },
  {
    id: 'd12',
    name: 'Insalata Caprese',
    category: 'salat',
    description: 'Tomaten, Mozzarella di Bufala, Basilikum, Olivenöl.',
    price: 7.50,
    emoji: '🍅',
    image: null,
    available: true,
  },
  {
    id: 'd13',
    name: 'Tiramisu',
    category: 'dessert',
    description: 'Italienische Spezialität mit Mascarpone und Kaffee.',
    price: 4.50,
    emoji: '🍰',
    image: null,
    available: true,
  },
  {
    id: 'd14',
    name: 'Panna Cotta',
    category: 'dessert',
    description: 'Mit frischen Waldbeeren und Vanille.',
    price: 4.00,
    emoji: '🍮',
    image: null,
    available: true,
  },
  {
    id: 'd15',
    name: 'Coca-Cola 0,33l',
    category: 'getraenk',
    description: 'Erfrischend und kalt serviert.',
    price: 2.50,
    emoji: '🥤',
    image: null,
    available: true,
  },
  {
    id: 'd16',
    name: 'Mineralwasser 0,5l',
    category: 'getraenk',
    description: 'Still oder mit Kohlensäure.',
    price: 2.00,
    emoji: '💧',
    image: null,
    available: true,
  },
  {
    id: 'd17',
    name: 'Espresso',
    category: 'getraenk',
    description: 'Italienische Röstung, stark und aromatisch.',
    price: 1.80,
    emoji: '☕',
    image: null,
    available: true,
  },
];

const CATEGORY_LABELS = {
  pizza: 'Pizza',
  pasta: 'Pasta',
  salat: 'Salat',
  dessert: 'Dessert',
  getraenk: 'Getränke',
};

const DataStore = {
  getDishes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DISHES);
      if (!raw) {
        this.saveDishes(DEFAULT_DISHES);
        return [...DEFAULT_DISHES];
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Fehler beim Laden der Speisen:', e);
      return [...DEFAULT_DISHES];
    }
  },

  saveDishes(dishes) {
    localStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
  },

  addDish(dish) {
    const dishes = this.getDishes();
    const newDish = { ...dish, id: 'd' + Date.now() };
    dishes.push(newDish);
    this.saveDishes(dishes);
    return newDish;
  },

  updateDish(id, updates) {
    const dishes = this.getDishes();
    const idx = dishes.findIndex(d => d.id === id);
    if (idx === -1) return null;
    dishes[idx] = { ...dishes[idx], ...updates };
    this.saveDishes(dishes);
    return dishes[idx];
  },

  deleteDish(id) {
    const dishes = this.getDishes().filter(d => d.id !== id);
    this.saveDishes(dishes);
  },

  resetDishes() {
    this.saveDishes(DEFAULT_DISHES);
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getPassword() {
    return localStorage.getItem(STORAGE_KEYS.PASSWORD) || DEFAULT_PASSWORD;
  },

  setPassword(pw) {
    localStorage.setItem(STORAGE_KEYS.PASSWORD, pw);
  },

  isAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  setAuthenticated(value) {
    if (value) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },
};

function formatPrice(value) {
  return value.toFixed(2).replace('.', ',') + ' €';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
