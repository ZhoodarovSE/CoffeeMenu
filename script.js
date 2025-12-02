let currentLang = 'ru';

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('language-screen').style.display = 'none';
    document.getElementById('menu-screen').classList.remove('hidden');
}