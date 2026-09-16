const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({error: err.message});
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
            if (err) return res.status(500).json({error: err.message});
            if (results.length == 0) return res.status(404).json({error: 'product not found'});
            res.json(results[0]);
        }
    );
});

module.exports = router;