var express = require('express');
var router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const verifyToken = require('../controllers/verifyToken');
const { ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.use(bodyParser.json());
// router.use(verifyToken);

/* GET users listing. */
router.get('/', userController.getAllUsers);

/* Create new user. */
router.post('/create', upload.single('image'), userController.createNewUser);

/* Update user by Id */
router.put('/update/:id', userController.updateUserById);

/* Delete user by Id */
router.delete('/delete/:id', userController.deleteUserById);

/* View All Followers */
router.get('/allFollower', async (req, res, next) => {
    const userId = req.decoded.userId;
    const connectionName = 'following';
    try {
        const result = await userController.getConnections(userId, connectionName);
        res.json(result);
    } catch (error) {
        return { 'Error in All follower': `${error}` };
    }
});

/* View All Following */
router.get('/allFollowing', async (req, res, next) => {
    const userId = req.decoded.userId;
    const connectionName = 'followers';
    try {
        const result = await userController.getConnections(userId, connectionName);
        res.json(result);
    } catch (error) {
        return { Error: `${error}` };
    }
});

/* GET user by Id. */
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        console.log(`Get user by id start with the Request: ${userId}`);
        if (!userId) {
            res.status(400).json({ Error: 'Incomplete or invalid data. Please provide all required information.' });
        }
        const filter = { _id: new ObjectId(userId) };
        console.log(`Filter: ${JSON.stringify(filter)}`);
        const response = await userController.getUserByField(filter);
        if (response) {
            res.status(200).json(response);
        } else {
            res.status(404).json({ Error: 'User not found' });
        }
    } catch (error) {
        res.json({ Error: `Something went wrong with productId: ${error}` });
    }
});

/* Follow */
router.put('/follow', async (req, res, next) => {
    console.log(`Add Follow payload request : ${JSON.stringify(req.query)}`);
    const followId = req.query.followId;
    const userId = req.decoded.userId;
    try {
        const result = await userController.addFollow(followId, userId);
        res.json(result);
    } catch (error) {
        return { Error: `${error}` };
    }
});

module.exports = router;
