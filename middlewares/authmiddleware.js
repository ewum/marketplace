const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({error: 'no token provided'});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({error: 'invalid or expired token'});
        }
        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;