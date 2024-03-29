var express = require('express');
const verifyToken = require('../controllers/verifyToken');
const flockController = require('../controllers/flockController');
var router = express.Router();

// router.use(verifyToken.verifyToken);

router.get('/', async (req, res, next) => {
    const { userId, userName } = req.decoded;
    res.json({ userId, userName });
});

/* Create new flock. */
router.post('/create', async (req, res, next) => {
    try {
        console.log(`Create Flock payload request : ${JSON.stringify(req.body)}`);
        const payload = req.body;
        const userId = req.decoded.userId;
        const result = await flockController.createFlock(userId, payload);
        res.json({ result });
    } catch (error) {
        return { Error: `Something went wrong : ${error}` };
    }
});

/* Add new comment on flock. */
router.post('/addComment', async (req, res, next) => {
    try {
        console.log(`Add new comment on Flock payload request : ${JSON.stringify(req.body)}`);
        const payload = req.body;
        const userId = req.decoded.userId;
        const result = await flockController.addFlockComment(userId, payload);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in add comment: ${error}` });
    }
});

/* Show all comments on flock. */
router.get('/showAllComment', async (req, res, next) => {
    try {
        console.log(`Show all comments on Flock payload request : ${JSON.stringify(req.query)}`);
        const payload = req.query;
        const result = await flockController.showFlockComments(payload);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in show all comments: ${error}` });
    }
});

/* Add new like on flock. */
router.post('/addLike', async (req, res, next) => {
    try {
        console.log(`Add new like on flock payload request : ${JSON.stringify(req.body)}`);
        const payload = req.body;
        const userId = req.decoded.userId;
        const result = await flockController.addFlockLike(userId, payload);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in add like: ${error}` }, { statusCode: 500 });
    }
});

/* Save flock. */
router.post('/saveFlock', async (req, res, next) => {
    try {
        console.log(`Save new flock payload request : ${JSON.stringify(req.query)}`);
        const payload = req.query;
        const userId = req.decoded.userId;
        const result = await flockController.saveFlock(userId, payload);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in add like: ${error}` }, { statusCode: 500 });
    }
});

/* View saved flock.. */
router.get('/viewSavedFlock', async (req, res, next) => {
    try {
        const userId = req.decoded.userId;
        const result = await flockController.viewSavedFlock(userId);
        res.status(result?.statusCode).json({ response: result.response });
    } catch (error) {
        res.status(500).json({ Exception: `Exception in add like: ${error}` }, { statusCode: 500 });
    }
});

module.exports = router;
