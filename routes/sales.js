const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/', authMiddleware, (req, res) => {
	db.query(
		`SELECT o.*, p.seller_id
		FROM orders o
		JOIN products p ON o.product_id = p.id
		WHERE p.seller_id = ?`,
		[req.user.id],
		(err, results) => {
			if (err) return res.status(500).json({error: 'internal server error'});
			res.json(results);
		}
	);
});

router.get('/:order_id', authMiddleware, (req, res) => {
	const {order_id} = req.params;
	db.query(
		`SELECT o.*, p.seller_id
		FROM orders o
		JOIN products p ON o.product_id = p.id
		WHERE o.id = ? AND p.seller_id = ?`,
		[order_id, req.user.id],
		(err, results) => {
			if (err) return res.status(500).json({error: 'internal server error'});
			if (results.length == 0) return res.status(404).json({error: 'no sale found'});
			res.json(results[0]);
		}
	);
});

router.patch('/:order_id/cancel', authMiddleware, (req, res) => {
	const {order_id} = req.params;
	db.query(
		`UPDATE orders o
		JOIN products p ON o.product_id = p.id
		SET o.status = ?
		WHERE o.id = ? AND p.seller_id = ? AND o.status in ('pending', 'paid')`,
		['cancelled', order_id, req.user.id],
		(err, result) => {
			if (err) return res.status(500).json({error: 'internal server error'});
			if (result.length == 0) return res.status(404).json({error: 'no sale found'});
			if (result.affectedRows === 0) return res.status(400).json({error: 'order can not be cancelled'});
			res.json({message: 'sale cancelled successfully'});
		}	
	);
});

module.exports = router;