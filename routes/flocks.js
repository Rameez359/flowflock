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
    try {
        const result = await flockController.createFlock(req);
        res.json({ result });
    } catch (error) {
        return ({ "Error": `Something went wrong : ${error}` });
    }
});


module.exports = router;