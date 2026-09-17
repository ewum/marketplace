const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/', authMiddleware, (req, res) => {
    db.query(
        `SELECT p.name, o.quantity, o.total, o.status, o.created_at
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.buyer_id = ?`,
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.json(results);
        }
    );
});

router.get('/:order_id', authMiddleware, (req, res) => {
    const {order_id} = req.params;
    db.query(
        `SELECT p.name AS product_name, p.price AS product_price, seller.id AS seller_id, seller.name AS seller_name, o.quantity, o.total, o.status, o.shipping, o.created_at
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users seller ON p.seller_id = seller.id
        WHERE o.id = ? AND o.buyer_id = ?`,
        [order_id, req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            if (results.length == 0) return res.status(404).json({error: 'order not found'});
            res.json(results);
        }
    );
});

module.exports = router