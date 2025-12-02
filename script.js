let currentLang = 'ru';

async function loadCategories() {
    const res = await fetch('/api/categories');
    const categories = await res.json();

    const container = document.getElementById('categories');
    container.innerHTML = '';

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.style = "background:white; border-radius:15px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1); cursor:pointer;";
        card.innerHTML = `
            <img src="${cat.image}" style="width:100%; height:150px; object-fit:cover;">
            <h3 style="padding:15px; color:#8B6F47;">${cat['name_' + currentLang]}</h3>
        `;
        card.onclick = () => showItems(cat.id, cat['name_' + currentLang]);
        container.appendChild(card);
    });
}

function showItems(catId, catName) {
    alert('Переход в категорию: ' + catName + ' (ID: ' + catId + ')');
    // Здесь потом будет реальная загрузка товаров
}

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('menu-screen').classList.remove('hidden');
    loadCategories();
}