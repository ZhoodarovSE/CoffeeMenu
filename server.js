const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('/api/categories', (req, res) => {
    res.json([
        { id: 1, name_ru: "Кофе", name_en: "Coffee", image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400" },
        { id: 2, name_ru: "Чай", name_en: "Tea", image: "https://images.unsplash.com/photo-1571934811356-5cc061b845f6821f?w=400" },
        { id: 3, name_ru: "Десерты", name_en: "Desserts", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400" }
    ]);
});

// Новый маршрут из Этапа 7
app.get('/api/items/:categoryId', (req, res) => {
    const items = {
        1: [{ id: 1, name_ru: "Эспрессо", name_en: "Espresso", description_ru: "Крепкий чёрный кофе", price: 150, image: "https://images.unsplash.com/photo-1577968894067-bb3b845f0f49?w=400" }],
        2: [{ id: 2, name_ru: "Зелёный чай", name_en: "Green Tea", price: 120, image: "https://images.unsplash.com/photo-1622483762971-1ba7682218e2?w=400" }],
        3: [{ id: 3, name_ru: "Тирамису", name_en: "Tiramisu", price: 280, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" }]
    };
    res.json(items[req.params.categoryId] || []);
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});