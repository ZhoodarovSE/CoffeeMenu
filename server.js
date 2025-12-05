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

            // === КОФЕ (category_id = 1) ===
            const coffeeItems = [
                {name_ru: 'Эспрессо', name_en: 'Espresso', desc_ru: 'Крепкий чёрный кофе из свежих зёрен', desc_en: 'Strong black coffee from fresh beans', price: 150, img: 'https://images.unsplash.com/photo-1577968894067-bb3b845f0f49?w=400', sort: 1},
                {name_ru: 'Американо', name_en: 'Americano', desc_ru: 'Эспрессо с добавлением горячей воды', desc_en: 'Espresso diluted with hot water', price: 170, img: 'https://images.unsplash.com/photo-1551030177-1378dd1d1b2b?w=400', sort: 2},
                {name_ru: 'Капучино', name_en: 'Cappuccino', desc_ru: 'Эспрессо с молочной пеной', desc_en: 'Espresso with steamed milk foam', price: 220, img: 'https://images.unsplash.com/photo-1571934806438-0d13a9b4e3b6?w=400', sort: 3},
                {name_ru: 'Латте', name_en: 'Latte', desc_ru: 'Эспрессо с большим количеством молока', desc_en: 'Espresso with plenty of milk', price: 250, img: 'https://images.unsplash.com/photo-1517251189740-13a77a27b9e9?w=400', sort: 4}
            ];

            // === ЧАЙ (category_id = 2) ===
            const teaItems = [
                {name_ru: 'Зелёный чай', name_en: 'Green Tea', desc_ru: 'Классический зелёный чай', desc_en: 'Classic green tea', price: 180, img: 'https://images.unsplash.com/photo-1622485767848-9f165f8c3e2c?w=400', sort: 1},
                {name_ru: 'Чёрный чай', name_en: 'Black Tea', desc_ru: 'Ароматный чёрный чай', desc_en: 'Fragrant black tea', price: 180, img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400', sort: 2},
                {name_ru: 'Фруктовый чай', name_en: 'Fruit Tea', desc_ru: 'Чай с кусочками фруктов и ягод', desc_en: 'Tea with fruit and berry pieces', price: 220, img: 'https://images.unsplash.com/photo-1552253835-c2a9f53e0b38?w=400', sort: 3},
                {name_ru: 'Матча латте', name_en: 'Matcha Latte', desc_ru: 'Японская матча с молоком', desc_en: 'Japanese matcha with milk', price: 280, img: 'https://images.unsplash.com/photo-1622480924066-2a9431e9b7e5?w=400', sort: 4}
            ];

            // === ДЕСЕРТЫ (category_id = 3) ===
            const dessertItems = [
                {name_ru: 'Тирамису', name_en: 'Tiramisu', desc_ru: 'Классический итальянский десерт', desc_en: 'Classic Italian dessert', price: 320, img: 'https://images.unsplash.com/photo-1563805042-7684c7f057f3?w=400', sort: 1},
                {name_ru: 'Чизкейк', name_en: 'Cheesecake', desc_ru: 'Нежный сырный торт с ягодами', desc_en: 'Delicate cream cheese cake with berries', price: 350, img: 'https://images.unsplash.com/photo-1565958016192-0a881a0c5067?w=400', sort: 2},
                {name_ru: 'Эклер', name_en: 'Eclair', desc_ru: 'Воздушный эклер с кремом', desc_en: 'Airy eclair with cream', price: 200, img: 'https://images.unsplash.com/photo-1623337363-9db2c7d9aa7f?w=400', sort: 3},
                {name_ru: 'Макаронс', name_en: 'Macarons', desc_ru: 'Французские миндальные пирожные', desc_en: 'French almond meringue cookies', price: 250, img: 'https://images.unsplash.com/photo-1558326568-4c7d1e6d014a?w=400', sort: 4}
            ];

            // Вставляем все позиции
            const allItems = [
                ...coffeeItems.map(i => [1, i.name_ru, i.name_en, i.desc_ru, i.desc_en, i.price, i.img, i.sort]),
                ...teaItems.map(i => [2, i.name_ru, i.name_en, i.desc_ru, i.desc_en, i.price, i.img, i.sort]),
                ...dessertItems.map(i => [3, i.name_ru, i.name_en, i.desc_ru, i.desc_en, i.price, i.img, i.sort])
            ];

            const stmt = db.prepare(`INSERT INTO items (category_id, name_ru, name_en, description_ru, description_en, price, image, sort) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

            allItems.forEach(item => {
                stmt.run(item, err => { if (err) console.error(err); });
            });

            stmt.finalize();
        }
    });
});

// ==================== API ====================

// API для категорий
app.get('/api/categories', (req, res) => {
    db.all("SELECT * FROM categories ORDER BY sort ASC, id ASC", (err, rows) => {
        if (err) return res.status(500).json({error: err});
        res.json(rows);
    });
});

// API для позиций в категории
app.get('/api/items/:categoryId', (req, res) => {
    const catId = req.params.categoryId;
    db.all("SELECT * FROM items WHERE category_id = ? ORDER BY sort ASC, id ASC", [catId], (err, rows) => {
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
    console.log('Админка: http://localhost:3000/admin.html (пароль: 12345)');
});