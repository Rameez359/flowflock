var express = require('express');
const verifyToken = require('../controllers/verifyToken');
const feedController = require('../controllers/feedController');
var router = express.Router();

// router.use(verifyToken);

router.get('/', async (req, res, next) => {
    const { userId, userName } = req.decoded;
    res.json({ userId, userName });
});
router.get('/get_feed', async (req, res, next) => {
    try {
        const userId = req.decoded.userId;
        console.log(`user id ${userId}`);
        const result = await feedController.getUserFeed(userId);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in get feed: ${error}` });
    }
});
module.exports = router;
