/* Небольшие интерактивные функции для учебного прототипа. */

// Подсвечиваем страницу, на которой находится пользователь.
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav__link').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.setAttribute('aria-current', 'page');
  }
});

// Демонстрационный подбор стиля по ответам пользователя.
const styleQuiz = document.querySelector('.js-style-quiz');
if (styleQuiz) {
  styleQuiz.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(styleQuiz);
    const paletteNames = { warm: 'тёплая палитра', cool: 'холодная палитра', neutral: 'нейтральная палитра' };
    const moodNames = { classic: 'спокойная классика', casual: 'комфортный casual', romantic: 'романтичные детали' };
    const purposeNames = { everyday: 'повседневных образов', work: 'учёбы и работы', party: 'особого случая' };
    const fitNames = { waist: 'силуэт с акцентом на талии', straight: 'прямой силуэт', relaxed: 'свободную посадку' };
    const result = document.querySelector('.js-quiz-result');
    result.innerHTML = `<strong>Твоё направление: ${moodNames[formData.get('mood')]}.</strong><span>Для ${purposeNames[formData.get('purpose')]} попробуй ${paletteNames[formData.get('palette')]} и ${fitNames[formData.get('fit')]}. В каталоге уже есть подходящие идеи.</span><br><a class="text-link" href="catalog.html">Перейти к подборке ↗</a>`;
    result.hidden = false;
  });
}

// Избранное сохраняется в браузере. Авторизация и сервер пока не нужны.
const FAVORITES_KEY = 'stylemuse-favorites';
function readFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); }
  catch { return []; }
}
function updateFavoriteCount() {
  const count = readFavorites().length;
  document.querySelectorAll('.js-saved-count').forEach((item) => { item.textContent = count; });
}
function updateFavoriteButtons() {
  const favorites = readFavorites();
  document.querySelectorAll('.js-favorite').forEach((button) => {
    const saved = favorites.includes(button.dataset.productId);
    button.setAttribute('aria-pressed', String(saved));
    button.textContent = saved ? '♥' : '♡';
  });
}
document.querySelectorAll('.js-favorite').forEach((button) => {
  button.addEventListener('click', () => {
    const favorites = readFavorites();
    const productId = button.dataset.productId;
    const updated = favorites.includes(productId) ? favorites.filter((id) => id !== productId) : [...favorites, productId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    updateFavoriteButtons();
    updateFavoriteCount();
  });
});
updateFavoriteButtons();
updateFavoriteCount();

// Фильтры каталога.
const categoryFilter = document.querySelector('.js-filter-category');
const occasionFilter = document.querySelector('.js-filter-occasion');
const searchFilter = document.querySelector('.js-filter-search');
const productCards = [...document.querySelectorAll('.product-card[data-category]')];
function filterProducts() {
  if (!productCards.length) return;
  const category = categoryFilter?.value || 'all';
  const occasion = occasionFilter?.value || 'all';
  const search = (searchFilter?.value || '').trim().toLowerCase();
  let visible = 0;
  productCards.forEach((card) => {
    const categoryMatches = category === 'all' || card.dataset.category === category;
    const occasionMatches = occasion === 'all' || card.dataset.occasion.split(' ').includes(occasion);
    const searchMatches = card.dataset.name.toLowerCase().includes(search);
    const show = categoryMatches && occasionMatches && searchMatches;
    card.hidden = !show;
    if (show) visible += 1;
  });
  document.querySelector('.js-product-count').textContent = visible;
  document.querySelector('.js-empty-state').hidden = visible !== 0;
}
[categoryFilter, occasionFilter, searchFilter].forEach((control) => control?.addEventListener('input', filterProducts));
document.querySelector('.js-reset-filters')?.addEventListener('click', () => {
  if (categoryFilter) categoryFilter.value = 'all';
  if (occasionFilter) occasionFilter.value = 'all';
  if (searchFilter) searchFilter.value = '';
  filterProducts();
});
// Подхватываем категорию из ссылки с главной страницы.
const requestedCategory = new URLSearchParams(window.location.search).get('category');
if (requestedCategory && categoryFilter && ['clothes', 'jewelry', 'beauty'].includes(requestedCategory)) {
  categoryFilter.value = requestedCategory;
  filterProducts();
}

// Сравнение двух товаров.
const COMPARE_PRODUCTS = {
  alba: { name: 'Платье-комбинация Alba', category: 'Одежда', price: '6 490 ₽', purpose: 'Каждый день / работа', tone: 'Тёплый сливочный' },
  forma: { name: 'Жакет Forma', category: 'Одежда', price: '8 990 ₽', purpose: 'Работа / каждый день', tone: 'Оливковый нейтральный' },
  luna: { name: 'Серьги Luna', category: 'Украшения', price: '3 290 ₽', purpose: 'Каждый день / праздник', tone: 'Золотистый' },
  sol: { name: 'Колье Sol', category: 'Украшения', price: '4 590 ₽', purpose: 'Работа / праздник', tone: 'Золотистый' },
  rosewood: { name: 'Помада Rosewood', category: 'Красота', price: '1 590 ₽', purpose: 'Каждый день / праздник', tone: 'Розово-коричневый' },
  mauve: { name: 'Лак Soft Mauve', category: 'Красота', price: '790 ₽', purpose: 'Каждый день / работа', tone: 'Пыльная роза' }
};
let compareItems = [];
const compareDialog = document.querySelector('#compare-dialog');
function updateCompareInterface() {
  const count = document.querySelector('.js-compare-count');
  const openButton = document.querySelector('.js-open-compare');
  if (count) count.textContent = compareItems.length;
  if (openButton) openButton.hidden = compareItems.length !== 2;
  document.querySelectorAll('.js-compare').forEach((button) => {
    const selected = compareItems.includes(button.dataset.productId);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? 'Выбран' : 'Сравнить';
  });
}
document.querySelectorAll('.js-compare').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.productId;
    if (compareItems.includes(id)) compareItems = compareItems.filter((item) => item !== id);
    else if (compareItems.length < 2) compareItems.push(id);
    else compareItems = [compareItems[1], id];
    updateCompareInterface();
  });
});
document.querySelector('.js-open-compare')?.addEventListener('click', () => {
  if (compareItems.length !== 2 || !compareDialog) return;
  const [first, second] = compareItems.map((id) => COMPARE_PRODUCTS[id]);
  const rows = [['Позиция', 'name'], ['Категория', 'category'], ['Цена', 'price'], ['Подходит для', 'purpose'], ['Цвет / оттенок', 'tone']];
  document.querySelector('.js-compare-table').innerHTML = `<table class="compare-table"><thead><tr><th></th><th>${first.name}</th><th>${second.name}</th></tr></thead><tbody>${rows.slice(1).map(([label, key]) => `<tr><th>${label}</th><td>${first[key]}</td><td>${second[key]}</td></tr>`).join('')}</tbody></table>`;
  compareDialog.showModal();
});
document.querySelector('.js-close-compare')?.addEventListener('click', () => compareDialog?.close());
compareDialog?.addEventListener('click', (event) => { if (event.target === compareDialog) compareDialog.close(); });
updateCompareInterface();

// Модальное окно с формой заявки на странице товара.
const orderDialog = document.querySelector('#order-dialog');
document.querySelector('.js-open-order')?.addEventListener('click', () => orderDialog?.showModal());
document.querySelector('.js-close-order')?.addEventListener('click', () => orderDialog?.close());
orderDialog?.addEventListener('click', (event) => { if (event.target === orderDialog) orderDialog.close(); });

// Общая обработка учебных форм: проверяем поля и показываем сообщение вместо отправки на сервер.
function handleDemoForm(selector, messageSelector) {
  const form = document.querySelector(selector);
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const message = document.querySelector(messageSelector);
    if (message) message.hidden = false;
    form.reset();
  });
}
handleDemoForm('.js-request-form', '.js-form-success');
handleDemoForm('.js-contact-form', '.js-contact-success');
handleDemoForm('.js-dialog-form', '.js-dialog-success');

// Кнопка «Наверх» (если добавлена на страницу).
document.querySelector('.js-scroll-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
