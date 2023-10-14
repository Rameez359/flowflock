const jwt = require('jsonwebtoken');

verifyToken = (req, res, next)=>{
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.decoded = decoded;
    next();
  });
}

module.exports = verifyToken;