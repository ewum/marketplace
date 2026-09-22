const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middlewares/authmiddleware');

router.post('/register', (req, res) => {
    const {name, email, password, confirm_password} = req.body;
    if (!name || !email || !password || !confirm_password) {
        return res.status(400).json({error: 'missing fields'});
    } 
    if (password != confirm_password) {
        return res.status(400).json({error: 'passwords do not match'});
    }
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (results.length > 0) {
            return res.status(400).json({error: 'email already registred'});
        }
    });
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({error: 'internal server error'});
        db.query(
            'INSERT INTO users(name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hash],
            (err, result) => {
                if (err) return res.status(500).json({error: 'internal server error'});
                const token = jwt.sign(
                    {id: result.insertId, email: email},
                    process.env.JWT_SECRET,
                    {expiresIn: '10m'}
                );
                res.cookie('token', token, {httpOnly: true});
                res.status(200).json({message: 'registred successfully'});
            }
        );
    });
});

router.post('/login', (req, res ) => {
    const {email, password} = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({error: 'internal server error'});
        if (results.length === 0) return res.status(401).json({error: 'invalid credentials'});
        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, match) => {
            if (err) return res.status(500).json({error: 'internal server error'});
            if (!match) return res.status(401).json({error: 'invalid credentials'});
            const token = jwt.sign(
                {id: user.id, email: user.email},
                process.env.JWT_SECRET,
                {expiresIn: '10m'}
            );
            res.cookie('token', token, {httpOnly: true});
            res.status(200).json({message: 'logged in successfully'});
        });
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({message: 'logged out successfully'});
});

router.get('/me', authMiddleware, (req, res) => {
    return res.status(200).json({id: req.user.id, email: req.user.email});
});

module.exports = router;