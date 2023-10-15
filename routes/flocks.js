var express = require('express');
const verifyToken = require('../controllers/verifyToken');
const flockController = require('../controllers/flockController');
var router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res, next) => {
    const { userId, userName } = req.decoded;
    res.json({ userId, userName });
});

/* Create new flock. */
router.post('/create', async (req, res, next) => {
    console.log(`Create Flock payload request : ${JSON.stringify(req.body)}`);
    const payload = req.body;
    const userId = req.decoded.userId;
    try {
        const result = await flockController.createFlock(userId, payload);
        res.json({ result });
    } catch (error) {
        return ({ "Error": `Something went wrong : ${error}` });
    }
});

/* Add new comment on flock. */
router.post('/addComment', async (req, res, next) => {
    try {
        console.log(`Create Flock payload request : ${JSON.stringify(req.body)}`);
        const payload = req.body;
        const userId = req.decoded.userId;
        const result = await flockController.addFlockComment(userId, payload);
        res.json({ result });
    } catch (error) {
        return ({ "Exception": `Exception in add comment: ${error}` });
    }
});


module.exports = router;