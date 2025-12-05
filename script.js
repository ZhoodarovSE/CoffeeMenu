let currentLang = 'ru';
let bonuses = parseInt(localStorage.getItem('ayla_bonuses')) || 0;
let historyStack = [];

// === Баннеры (Акции) ===
const banners = [
    { title_ru: "4-й кофе в подарок!", title_en: "Every 4th coffee is free!", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800" },
    { title_ru: "Скидка 20% с другом", title_en: "Bring a friend - 20% off", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800" },
    { title_ru: "Счастливые часы -30%", title_en: "Happy Hours -30%", img: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800" },
    // ИСПРАВЛЕНА ССЫЛКА НА ФОТО В ПОСЛЕДНЕМ БЛОКЕ:
    { title_ru: "Кофе + Десерт = -25%", title_en: "Coffee + Dessert = -25%", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" }
];

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
    updateBonusDisplay();
    // Скрываем кнопку пока не выбран язык
    toggleBackButton(false);
});

function updateBonusDisplay() {
    const el = document.getElementById('bonus-points');
    if(el) el.textContent = bonuses;
}

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');

    const isRu = lang === 'ru';
    // Переводы интерфейса
    document.querySelector('.play-text').textContent = isRu ? 'Бонусы' : 'Bonuses';
    document.getElementById('game-title').textContent = isRu ? 'Поймай кофе' : 'Catch Coffee';
    document.getElementById('game-desc').innerHTML = isRu
        ? 'Лови ☕️.<br>Избегай 🧂 🥄 🍰.<br>Пропуск чашки = проигрыш.'
        : 'Catch ☕️.<br>Avoid 🧂 🥄 🍰.<br>Miss a cup = Game Over.';
    document.querySelector('.section-title').textContent = isRu ? 'Акции' : 'Promo';

    initCarousel();
    loadCategories();
}

// === КАРУСЕЛЬ + СВАЙПЫ ===
let currentSlide = 0;
let carouselInterval;

function initCarousel() {
    const track = document.getElementById('carousel-track');
    const indicators = document.getElementById('carousel-indicators');
    const container = document.getElementById('carousel-container-box');

    if(!track) return;

    track.innerHTML = '';
    indicators.innerHTML = '';

    banners.forEach((banner, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `
            <img src="${banner.img}" draggable="false" onerror="this.src='https://via.placeholder.com/800x400'">
            <div class="carousel-caption"><h3>${currentLang === 'ru' ? banner.title_ru : banner.title_en}</h3></div>
        `;
        track.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = 'indicator' + (index === 0 ? ' active' : '');
        dot.onclick = () => { currentSlide = index; updateCarouselPosition(); };
        indicators.appendChild(dot);
    });

    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(carouselInterval);
    }, {passive: true});

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startCarouselAuto();
    }, {passive: true});

    container.addEventListener('mousedown', (e) => touchStartX = e.screenX);
    container.addEventListener('mouseup', (e) => {
        touchEndX = e.screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextSlide();
        if (touchEndX > touchStartX + 50) prevSlide();
    }

    updateCarouselPosition();
    startCarouselAuto();
}

function updateCarouselPosition() {
    const track = document.getElementById('carousel-track');
    if(track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.indicator').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function nextSlide() { currentSlide = (currentSlide + 1) % banners.length; updateCarouselPosition(); }
function prevSlide() { currentSlide = (currentSlide - 1 + banners.length) % banners.length; updateCarouselPosition(); }
function startCarouselAuto() { clearInterval(carouselInterval); carouselInterval = setInterval(nextSlide, 5000); }


// === МЕНЮ И НАВИГАЦИЯ ===

async function loadCategories() {
    const container = document.getElementById('categories');

    container.classList.remove('hidden');
    document.getElementById('promo-carousel').classList.remove('hidden');
    document.getElementById('items').classList.add('hidden');

    // ИЗМЕНЕНИЕ: Теперь кнопка "Назад" видна всегда, когда мы в меню
    toggleBackButton(true);
    historyStack = []; // Очищаем историю, значит мы на главной странице меню

    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();

        container.innerHTML = '';

        if(categories.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%; opacity:0.6;">Нет категорий</p>';
            return;
        }

        categories.forEach((cat, index) => {
            const div = document.createElement('div');
            div.className = 'category-card animate-fadeInUp';
            div.style.animationDelay = `${index * 0.1}s`;
            div.innerHTML = `
                <img src="${cat.image || 'img/placeholder.png'}" alt="${cat.name_ru}" onerror="this.src='https://via.placeholder.com/150'">
                <span class="category-title">${currentLang === 'ru' ? cat.name_ru : cat.name_en}</span>
            `;
            div.onclick = () => loadItems(cat.id, currentLang === 'ru' ? cat.name_ru : cat.name_en);
            container.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color:red; text-align:center;">Ошибка подключения к серверу</p>';
    }
}

async function loadItems(catId, catName) {
    // Добавляем маркер в историю, что мы ушли внутрь категории
    historyStack.push('categories');
    toggleBackButton(true);

    document.getElementById('categories').classList.add('hidden');
    document.getElementById('promo-carousel').classList.add('hidden');
    const container = document.getElementById('items');
    container.classList.remove('hidden');

    container.innerHTML = `
        <h2 class="section-title">${catName}</h2>
        <div id="items-list" class="items-list-container"><div class="loading">Loading...</div></div>
    `;

    try {
        const response = await fetch(`/api/items?category_id=${catId}`);
        const items = await response.json();
        const list = document.getElementById('items-list');
        list.innerHTML = '';

        if(items.length === 0) {
            list.innerHTML = '<p class="empty-state">В этой категории пока пусто</p>';
            return;
        }

        items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'item-card animate-fadeInUp';
            div.style.animationDelay = `${index * 0.1}s`;
            const desc = currentLang === 'ru' ? item.description_ru : item.description_en;
            div.innerHTML = `
                <img src="${item.image || 'img/placeholder.png'}" onerror="this.src='https://via.placeholder.com/150'">
                <div class="item-details">
                    <span class="item-name">${currentLang === 'ru' ? item.name_ru : item.name_en}</span>
                    ${desc ? `<span class="item-desc">${desc}</span>` : ''}
                    <span class="item-price">${item.price} ₽</span>
                </div>`;
            list.appendChild(div);
        });
    } catch (error) {
        console.error(error);
    }
}

// ИЗМЕНЕННАЯ ФУНКЦИЯ НАЗАД
function goBack() {
    // Если есть история (мы внутри категории), возвращаемся к категориям
    if (historyStack.length > 0) {
        historyStack.pop();
        document.getElementById('items').classList.add('hidden');
        document.getElementById('categories').classList.remove('hidden');
        document.getElementById('promo-carousel').classList.remove('hidden');
    } else {
        // Если истории нет (мы на главной странице меню), возвращаемся к ВЫБОРУ ЯЗЫКА
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('language-screen').classList.remove('hidden');
        toggleBackButton(false); // Скрываем кнопку на экране выбора языка
    }
}

function toggleBackButton(show) {
    const btn = document.getElementById('back-btn');
    if(btn) {
        btn.style.visibility = show ? 'visible' : 'hidden';
        btn.style.opacity = show ? '1' : '0';
    }
}

// ==========================================
// === ИГРА (БЕЗ ИЗМЕНЕНИЙ) ===
// ==========================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let gameRunning = false;
let score = 0;
let gameSpeed = 3;
let frame = 0;
let animationId;

let basket = { x: 0, y: 0, width: 80, height: 50, color: '#d4a574' };
let items = [];

function openGame() {
    const modal = document.getElementById('game-modal');
    modal.classList.remove('hidden');
    document.getElementById('high-score').textContent = localStorage.getItem('ayla_highscore') || 0;
    setTimeout(resizeCanvas, 100);
    window.addEventListener('resize', resizeCanvas);
}

function closeGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('game-modal').classList.add('hidden');
    window.removeEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && canvas) {
        canvas.width = modalContent.clientWidth;
        canvas.height = modalContent.clientHeight;
        basket.y = canvas.height - 80;
        basket.x = (canvas.width / 2) - (basket.width / 2);
    }
}

function startGame() {
    document.getElementById('game-start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    score = 0;
    gameSpeed = 3;
    items = [];
    frame = 0;
    gameRunning = true;
    resizeCanvas();
    gameLoop();
}

function moveBasket(clientX) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = clientX - rect.left - (basket.width / 2);
    if (x < 0) x = 0;
    if (x > canvas.width - basket.width) x = canvas.width - basket.width;
    basket.x = x;
}

if(canvas) {
    canvas.addEventListener('mousemove', (e) => { if(gameRunning) moveBasket(e.clientX); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(gameRunning) moveBasket(e.touches[0].clientX); }, {passive: false});
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    frame++;
    if (frame % 500 === 0) gameSpeed += 0.5;

    let currentSpawnRate = Math.max(20, 60 - Math.floor(score / 5));
    if (frame % currentSpawnRate === 0) spawnItem();

    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += gameSpeed;

        if (item.y + item.size >= basket.y && item.x + item.size > basket.x && item.x < basket.x + basket.width && item.y < basket.y + basket.height) {
            if (item.type === 'good') {
                score++;
                showScoreFx();
                items.splice(i, 1);
                i--;
            } else {
                gameOver(currentLang === 'ru' ? 'Вы съели не то! 🧂' : 'Avoid the trash! 🧂');
                return;
            }
        }
        if (item.y > canvas.height) {
            if (item.type === 'good') {
                gameOver(currentLang === 'ru' ? 'Кофе упал! 😭' : 'You missed the coffee! 😭');
                return;
            } else {
                items.splice(i, 1);
                i--;
            }
        }
    }
}

function spawnItem() {
    const isGood = Math.random() > 0.4;
    const badIcons = ['🧂', '🥄', '🧊', '🧁'];
    const icon = isGood ? '☕️' : badIcons[Math.floor(Math.random() * badIcons.length)];
    items.push({ x: Math.random() * (canvas.width - 40), y: -40, size: 40, type: isGood ? 'good' : 'bad', icon: icon });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = basket.color;
    ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
    ctx.fillStyle = '#0f1a18';
    ctx.fillRect(basket.x + 5, basket.y + 10, basket.width - 10, 5);
    ctx.font = "35px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    items.forEach(item => { ctx.fillText(item.icon, item.x, item.y); });
    ctx.fillStyle = "white";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText((currentLang==='ru'?"Счет: ":"Score: ") + score, 20, 40);
}

function gameOver(reason) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    let highscore = parseInt(localStorage.getItem('ayla_highscore')) || 0;
    if (score > highscore) { highscore = score; localStorage.setItem('ayla_highscore', highscore); }
    bonuses += score;
    localStorage.setItem('ayla_bonuses', bonuses);
    updateBonusDisplay();
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('game-over-reason').textContent = reason;
    document.getElementById('current-score').textContent = score;
}

function showScoreFx() {
    const el = document.getElementById('score-fx');
    if(!el) return;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = null;
    el.textContent = "+1";
    setTimeout(() => el.classList.add('hidden'), 500);
}