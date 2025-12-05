// script.js — полная версия с поддержкой RU + EN описаний

let currentLang = 'ru';
let currentCategoryId = null;
let historyStack = [];

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('back-btn').textContent = lang === 'ru' ? '← Назад' : '← Back';
    document.getElementById('cafe-name').textContent = 'AYLA';

    loadCategories();
}

async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const container = document.getElementById('categories');
        container.innerHTML = '';

        categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="${cat.image}" alt="${cat['name_' + currentLang]}" loading="lazy">
                <h3>${cat['name_' + currentLang]}</h3>
            `;
            card.onclick = () => showItems(cat.id, cat['name_' + currentLang]);
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Ошибка загрузки категорий:', err);
        alert('Ошибка загрузки меню. Попробуйте обновить страницу.');
    }
}

async function showItems(catId, catName) {
    currentCategoryId = catId;
    historyStack.push('categories');

    document.getElementById('categories').classList.add('hidden');
    document.getElementById('items').classList.remove('hidden');
    document.getElementById('cafe-name').textContent = 'AYLA';

    try {
        const res = await fetch(`/api/items/${catId}`);
        const items = await res.json();
        const container = document.getElementById('items');

        // Заголовок категории с красивым градиентом
        container.innerHTML = `
            <h2 style="
                text-align: center;
                margin: 30px 0 20px;
                font-size: 32px;
                font-weight: 800;
                background: linear-gradient(90deg, #d4a574, #f0d5b0);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 1.5px;
            ">${catName}</h2>
        `;

        if (items.length === 0) {
            const emptyText = currentLang === 'ru'
                ? 'Пока нет позиций в этой категории.'
                : 'No items in this category yet.';
            container.innerHTML += `<p style="text-align: center; color: #a8b5b2; margin-top: 40px; font-size: 18px;">${emptyText}</p>`;
        } else {
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';

                // Выбираем правильные поля в зависимости от языка
                const name = item['name_' + currentLang] || item.name_ru;
                const description = item['description_' + currentLang] || item.description_ru ||
                    (currentLang === 'ru' ? 'Вкусный выбор!' : 'Delicious choice!');

                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${name}" loading="lazy">
                    <div class="item-info">
                        <h3>${name}</h3>
                        <p>${description}</p>
                        <div class="price">${item.price} сом</div>
                    </div>
                `;
                container.appendChild(itemDiv);
            });
        }
    } catch (err) {
        console.error('Ошибка загрузки позиций:', err);
        alert(currentLang === 'ru' ? 'Ошибка загрузки позиций.' : 'Failed to load items.');
    }
}

function goBack() {
    if (historyStack.length > 0) {
        historyStack.pop();
        document.getElementById('items').classList.add('hidden');
        document.getElementById('categories').classList.remove('hidden');
        document.getElementById('cafe-name').textContent = 'AYLA';
    } else {
        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('language-screen').classList.remove('hidden');
    }
}

// Поддержка кнопки «Назад» в браузере
window.addEventListener('popstate', goBack);