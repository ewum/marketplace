const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/:user_id', (req, res) => {
	const {user_id} = req.params;
	db.query(
		`SELECT r.seller_id, r.rating, r.comment, r.buyer_id, buyer.name AS buyer_name
		FROM user_reviews r
		JOIN users buyer ON r.buyer_id = buyer.id
		WHERE r.seller_id = ?`,
		[user_id],
		(err, results) => {
			if (err) return res.status(500).json({error: err.message});
			res.json(results);
		}
	);
});

router.post('/:seller_id/rate', authMiddleware, (req, res) => {
	const {seller_id} = req.params;
	db.query(
		`INSERT INTO user_reviews (seller_id, buyer_id, rating, comment)
		VALUES (?, ?, ?, ?)
		WHERE EXISTS (
			SELECT 1
			FROM orders o
			JOIN products p ON o.product_id = p.id
			WHERE p.seller_id = ? AND o.buyer_id = ? AND o.status = 'delivered'
		)`,
		[seller_id, req.user.id, req.body.rating, req.body.comment, seller_id, req.user.id],
		(err, results) => {
			if (err) return res.status(500).json({error: err.message});
			res.status(201).json({message: 'review posted successfully'});
		}
	);
});

module.exports = router;