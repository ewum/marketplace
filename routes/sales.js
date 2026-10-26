const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/', authMiddleware, (req, res) => {
	db.query(
		`SELECT i.quantity, i.unit_price, i.status, p.id, p.name, o.created_at, o.buyer_id
		FROM order_items i
		JOIN products p ON p.id = i.product_id
		JOIN orders o ON o.id = i.order_id
		WHERE p.seller_id = ?`,
		[req.user.id],
		(err, results) => {
			if (err) return res.status(500).json({error: 'internal server error'});
			res.json(results);
		}
	);
});

router.patch('/:order_items_id', authMiddleware, (req, res) => {
	const {order_items_id} = req.params;
	db.query(
		`UPDATE order_items i
		JOIN products p ON p.id = i.product_id
		SET i.status = 'cancelled'
		WHERE i.id = ? AND p.seller_id = ? AND i.status in ('pending', 'paid')`,
		[order_items_id, req.user.id],
		(err, result) => {
			if (err) return res.status(500).json({error: 'internal server error'});
			if (result.length == 0) return res.status(404).json({error: 'no sale found'});
			if (result.affectedRows === 0) return res.status(400).json({error: 'order can not be cancelled'});
			res.json({message: 'sale cancelled successfully'});
		}	
	);
});

module.exports = router;