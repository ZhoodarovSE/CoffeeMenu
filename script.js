let currentLang = 'ru';

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('menu-screen').style.display = 'block';
    alert('Вы выбрали: ' + (lang === 'ru' ? 'Русский' : 'English'));
}