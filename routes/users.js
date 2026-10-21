const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const db = require('../db');
const multer = require('multer');
const upload = multer({dest: 'public/uploads'});
const router = express.Router();

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

router.patch('/:id/edit', authMiddleware, upload.array('images'), (req, res) => {
	const {country, state, city, image_url} = req.body;
	const {url_id} = req.params;
	const user_id = req.user.id;
	if (url_id != user_id) {
		return res.status(400).json({error: 'unauthorized action'});
	}
	db.query(
		`UPDATE users
		SET country = ?, state = ?, city = ?, image_url = ?
		WHERE id = ?`,
		[country, state, city, image_url, user_id],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: 'internal server error'});
			}
			res.json({message: 'profile edited successfully'})
		}
	);
});

module.exports = router;