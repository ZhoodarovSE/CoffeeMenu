const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('./menu.db');

app.use(express.json());
app.use(express.static(__dirname)); // Раздаём все статические файлы

// Создаём таблицы, если их нет
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ru TEXT,
    name_en TEXT,
    image TEXT,
    sort INTEGER DEFAULT 0
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    name_ru TEXT,
    name_en TEXT,
    description_ru TEXT,
    description_en TEXT,
    price REAL,
    image TEXT,
    sort INTEGER DEFAULT 0
  )`);

    // Добавляем примеры данных, если база пустая
    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (row && row.count === 0) {
            const examples = [
                {name_ru: "Кофе", name_en: "Coffee", image: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400", sort: 1},
                {name_ru: "Чай", name_en: "Tea", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400", sort: 2},
                {name_ru: "Десерты", name_en: "Desserts", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400", sort: 3}
            ];
            examples.forEach(c => {
                db.run(`INSERT INTO categories (name_ru, name_en, image, sort) VALUES (?, ?, ?, ?)`,
                    [c.name_ru, c.name_en, c.image, c.sort], (err) => {
                        if (err) console.error(err);
                    });
            });

            // Пример позиции в кофе
            db.run(`INSERT INTO items (category_id, name_ru, name_en, description_ru, description_en, price, image, sort) VALUES 
        (1, 'Эспрессо', 'Espresso', 'Крепкий чёрный кофе из свежих зёрен', 'Strong black coffee from fresh beans', 150, 'https://images.unsplash.com/photo-1577968894067-bb3b845f0f49?w=400', 1)`);
        }
    });
});

// API для категорий
app.get('/api/categories', (req, res) => {
    db.all("SELECT * FROM categories WHERE sort > 0 ORDER BY sort", (err, rows) => {
        if (err) return res.status(500).json({error: err});
        res.json(rows);
    });
});

// API для позиций в категории
app.get('/api/items/:categoryId', (req, res) => {
    const catId = req.params.categoryId;
    db.all("SELECT * FROM items WHERE category_id = ? AND sort > 0 ORDER BY sort", [catId], (err, rows) => {
        if (err) return res.status(500).json({error: err});
        res.json(rows);
    });
});

// Админ API: добавить категорию
app.post('/api/admin/categories', (req, res) => {
    const {name_ru, name_en, image} = req.body;
    if (!name_ru || !image) return res.status(400).json({error: 'Missing fields'});
    db.run(`INSERT INTO categories (name_ru, name_en, image, sort) 
          VALUES (?, ?, ?, COALESCE((SELECT MAX(sort) FROM categories), 0) + 1)`,
        [name_ru, name_en || name_ru, image], function(err) {
            if (err) return res.status(500).json({error: err});
            res.json({id: this.lastID, success: true});
        });
});

// Удалить категорию (и все позиции в ней)
app.delete('/api/admin/categories/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM items WHERE category_id = ?", [id], () => {
        db.run("DELETE FROM categories WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({error: err});
            res.json({success: true});
        });
    });
});

// Добавить позицию
app.post('/api/admin/items', (req, res) => {
    const {category_id, name_ru, name_en, description_ru, description_en, price, image} = req.body;
    if (!category_id || !name_ru || !price) return res.status(400).json({error: 'Missing fields'});
    db.run(`INSERT INTO items (category_id, name_ru, name_en, description_ru, description_en, price, image, sort) 
          VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT MAX(sort) FROM items WHERE category_id = ?), 0) + 1)`,
        [category_id, name_ru, name_en || name_ru, description_ru, description_en || description_ru, price, image, category_id], function(err) {
            if (err) return res.status(500).json({error: err});
            res.json({id: this.lastID, success: true});
        });
});

// Удалить позицию
app.delete('/api/admin/items/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM items WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({error: err});
        res.json({success: true});
    });
});

app.listen(3000, () => {
    console.log('Сервер запущен! Меню: http://localhost:3000');
    console.log('Админка: http://localhost:3000/admin.html (пароль: qwerty)');
});