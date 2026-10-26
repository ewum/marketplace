const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/', authMiddleware, (req, res) => {
    db.query(
        `SELECT o.id, o.total, o.created_at, SUM(i.quantity) AS quantity, GROUP_CONCAT(p.name SEPARATOR ', ') AS products
        FROM orders o
        JOIN order_items i ON o.id = i.order_id
        JOIN products p ON p.id = i.product_id
        WHERE o.buyer_id = ?
        GROUP BY o.id, o.total, o.created_at`,
        [req.user.id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'internal server error'});
            }
            res.json(results);
        }
    );
});

router.get('/:id', authMiddleware, (req, res) => {
    const {id} = req.params;
    db.query(
        `SELECT p.id, p.seller_id, p.name, i.quantity, i.unit_price, i.status,
            (SELECT image_url
            FROM product_images pi
            WHERE pi.product_id = p.id AND pi.order_number = 1) AS image_url
        FROM order_items i
        JOIN products p ON i.product_id = p.id
        JOIN orders o ON o.id = i.order_id
        WHERE o.id = ? AND o.buyer_id = ?`,
        [id, req.user.id],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'internal server error'});
            }
            res.json(results);
        }
    );
});

module.exports = router