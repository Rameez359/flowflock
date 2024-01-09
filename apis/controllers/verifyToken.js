const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret_key = process.env.SECRET_KEY;

const verifyToken = (req, res, next)=>{
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.decoded = decoded;
    next();
  });
}

module.exports = verifyToken;