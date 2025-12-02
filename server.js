const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('/api/categories', (req, res) => {
    res.json([
        { id: 1, name_ru: "Кофе", name_en: "Coffee", image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400" },
        { id: 2, name_ru: "Чай", name_en: "Tea", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400" },
        { id: 3, name_ru: "Десерты", name_en: "Desserts", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400" }
    ]);
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});