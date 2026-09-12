const express = require('express');
const router = express.Rounter();
const db = require('../db');

router.get('/:user_id', (req, res) => {
	const {user_id} = req.params;
	db.query(
		`SELECT r.seller_id, r.rating, r.comment, buyer.name
		FROM user_reviews r
		JOIN users buyer ON r.seller_id = buyer.id
		WHERE r.seller_id = ?`,
		[user_id],
		(err, results) => {
			if (err) return res.status(500).json({error: err.message});
			if (results.length == 0) return res.status(404).json({error: 'no reviews found'});
			res.json(results);
		}
	)
})

module.exports = router;