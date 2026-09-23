const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: 'public/uploads'});
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({error: 'internal server error'});
        res.json(results);
    });
});

router.get('/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) return res.status(500).json({error: 'internal server error'});
        res.json(results);
    });
});

router.get('/:product_id', (req, res) => {
    const {product_id} = req.params;
    db.query(
        `SELECT p.*, seller.name AS seller_name
        FROM products p 
        JOIN users seller ON p.seller_id = seller.id
        WHERE id = ?`,
        [product_id],
        (err, results) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            if (results.length == 0) return res.status(404).json({error: 'product not found'});
            res.json(results[0]);
        }
    );
});

router.get('/user/:user_id', (req, res) => {
    const {user_id} = req.params;
    db.query(
        'SELECT * FROM products WHERE seller_id = ?',
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            res.json(results);
        }
    );
});

router.post('/create', authMiddleware, upload.array('images'), (req, res) => {
    const {name, description, stock, price, category_id} = req.body;
    db.query( 
        `INSERT INTO products(seller_id, category_id, name, description, stock, price)
        VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, category_id, name, description, stock, price],
        (err, result) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            const product_id = result.insertId;
            const imageinserts = req.files.map(file =>
                [product_id, '/uploads/' + file.filename]
            );
            db.query(
                'INSERT INTO product_images(product_id, image_url) VALUES ?',
                [imageinserts],
                (err, result) => {
                    if (err) return res.status(500).json({error: 'internal server error'});
                    res.status(201).json({id: result.insertId});
                }
            );
        }
    );
});

module.exports = router;