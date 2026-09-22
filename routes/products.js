const express = require('express');
const router = express.Router();
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

router.get('/user/user_id', (req, res) => {
    const {user_id} = req.params;
    db.query(
        'SELECT * FROM products WHERE seller_id = ?',
        [user_id],
        (err, results) = {
            if (err) return res.status(500).json({error: 'internal server error'});
            if (results.length == 0) return res.status(404).json({error: 'no products found'});
            res.json(results);
        }
    );
});

router.post('/create', authMiddleware, (req, res) => {
    const {name, description, price, stock} = req.body;
    db.query(
        `INSERT INTO products(category_id, name, description, price, stock)
        VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, stock],
        (err, result) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            res.status(201).json({id: result.insertId});
        }
    );
});

module.exports = router;