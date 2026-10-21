const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:id', (req, res) => {
	const {id} = req.params;
	db.query(
		`SELECT name, image_url, country, state, city, created_at
		FROM users
		WHERE id = ?`,
		[id],
		(err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({error: 'internal server error'});
			}
			res.json(results[0]);
		}
	);
});

module.exports = router;