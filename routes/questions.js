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

router.post('/:product_id/ask', (req, res) => {
    const {product_id} = req.params;
    const {askwer_id, question} = req.body;
    db.query(
        `INSERT INTO product_questions(product_id, asker_id, question)
        VALUES (?, ?, ?)`,
        [product_id, askwer_id, question],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            res.status(201).json({message: 'question created successfully'});
        }
    )
})

router.patch('/:question_id/answer', authMiddleware, (req, res) => {
    const {question_id} = req.params;
    db.query(
        `UPDATE user_reviews
        SET answer = ?
        WHERE id = ? AND seller_id = ?`,
        [req.body.answer, question_id, req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            if (results.affectedRows === 0) return res.status(404).json({error: 'review not found'});
            res.status(200).json({message: 'question answered successfully'});
        }
    )
})

module.exports = router;