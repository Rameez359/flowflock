var express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('../controllers/verifyToken');

var router = express.Router();

router.use(verifyToken);
router.get('/', async function(req, res, next) {
    const { userId, userName } = req.decoded;
    res.json({ userId, userName });
});

module.exports = router;