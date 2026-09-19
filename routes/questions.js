const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.get('/:product_id', (req, res) => {
    const {product_id} = req.params;
    db.query(
        `SELECT q.*, asker.name AS asker_name, asker.id AS asker_id
        FROM product_questions q
        JOIN users asker ON q.asker_id = asker.id
        WHERE q.product_id = ?`,
        [product_id],
        (err, results) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            res.json(results);
        }
    );
});

router.post('/:product_id/ask', (req, res) => {
    const {product_id} = req.params;
    const {asker_id, question} = req.body;
    db.query(
        `INSERT INTO product_questions(product_id, asker_id, question)
        VALUES (?, ?, ?)`,
        [product_id, asker_id, question],
        (err, results) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            res.status(201).json({message: 'question created successfully'});
        }
    );
});

router.patch('/:question_id/answer', authMiddleware, (req, res) => {
    const {question_id} = req.params;
    db.query(
        `UPDATE product_questions
        SET answer = ?
        WHERE id = ? AND seller_id = ?`,
        [req.body.answer, question_id, req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            if (results.affectedRows === 0) return res.status(404).json({error: 'review not found'});
            res.status(200).json({message: 'question answered successfully'});
        }
    );
});

router.delete('/:question_id/delete', authMiddleware, (req, res) => {
    const {question_id} = req.params;
    db.query(
        `DELETE FROM product_questions q
        JOIN products p ON q.product_id = p.id
        WHERE q.id = ? AND p.seller_id = ?`,
        [question_id, req.user.id],
        (err, result) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            res.status(204).json({message: 'deleted question successfully'});
        }
    );
});

module.exports = router;