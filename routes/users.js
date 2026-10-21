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

router.patch('/:id', authMiddleware, upload.array('images'), (req, res) => {
	const {country, state, city, image_url} = req.body;
	const {id} = req.params;
	if (Number(id) !== req.user.id) {
		return res.status(403).json({error: 'unauthorized action'});
	}
	db.query(
		`UPDATE users
		SET country = ?, state = ?, city = ?, image_url = ?
		WHERE id = ?`,
		[country, state, city, image_url, id],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: 'internal server error'});
			}
			res.json({message: 'profile edited successfully'})
		}
	);
});

router.delete('/:id', authMiddleware, (req, res) => {
	const {id} = req.params;
	if (Number(id) !== req.user.id) {
		return res.status(403).json({error: 'unathorized action'});
	}
	db.query(
		`SELECT 1 FROM orders o
		JOIN products p ON o.product_id = p.id
		WHERE p.seller_id = ?`,
		[id],
		(err, results) => {
			if (err) {
				console.log(err);
				return res.status(500).json({error: 'internal server error'});
			}
			if (results.length > 0) {
				return res.status(403).json({error: 'account has sales'})
			}
		}
	);
	db.query(
		`DELETE FROM users WHERE id = ?`,
		[id],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: 'internal server error'});
			}
			res.status(204).json({error: 'successfully deleted your account'});
		}
	);
})l

module.exports = router;