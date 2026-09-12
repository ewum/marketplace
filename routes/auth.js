const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require ('../db');

router.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({error: 'missing fields'});
    }
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({error: err.message});
        db.query(
            'INSERT INTO users(name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hash],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.status(201).json({id: result.insertId, name, email});
            }
        );
    });
});

router.post('/login', (req, res ) => {
    const {email, password} = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({error: err.message});
        if (results.length === 0) return res.status(401).json({error: 'invalid credentials'});
        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, match) => {
            if (err) return res.status(500).json({error: err.message});
            if (!match) return res.status(401).json({error: 'invalid credentials'});
            const token = jwt.sign(
                {id: user.id, email: user.email},
                process.env.JWT_SECRET,
                {expiresIn: '10m'}
            );
            res.json({token});
        })
    })
});

module.exports = router;