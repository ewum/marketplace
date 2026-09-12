const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authmiddleware');
const db = require('../db');

router.get('/:product_id', (req, res) => {
    const {product_id} = req.params;
    db.query(
        'SELECT * FROM product_questions WHERE product_id = ?',
        [product_id],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.json(results);
        }
    )
})

router.patch('/:question_id', authMiddleware, (req, res) => {
    const {question_id} = req.params;
    db.query(
        `UPDATE user_reviews
        SET answer = ?, answered_at = NOW()
        WHERE id = ? AND seller_id = ?`,
        [req.body.answer, question_id, req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            if (results.affectedRows === 0) return res.status(404).json({error: 'review not found'});
            res.json(results);
        }
    )
})

module.exports = router;