var express = require('express');
var router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const verifyToken = require('../controllers/verifyToken');
// const storage = require('../controllers/fileUpload');
const { ObjectId } = require("mongodb");
const bodyParser = require('body-parser');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.use(bodyParser.json());
router.use(verifyToken);


/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const documents = await userController.getAllUsers();
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
});

/* Create new user. */
router.post('/create', upload.single('image'), async (req, res, next) => {
  try {
    const loadValue = req.body;
    const jsonData = JSON.parse(loadValue.json_data);
    const image = req.file.buffer;
    let { name, userName, bio, location, website, dateOfBirth, password } = jsonData;
    console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

    if (!(name, userName, dateOfBirth, password)) {
      res.status(400).json({ "Error": "Incomplete or invalid data. Please provide all required information." });
    }

    bio = bio ? bio : null;
    location = location ? location : null;
    website = website ? website : null;

    document = {
      "name": name,
      "userName": userName,
      "bio": bio,
      "location": location,
      "website": website,
      "dateOfBirth": dateOfBirth,
      "password": password,
      "profilePic": image
    };

    const response = await userController.createNewUser(document);
    if (response) {
      res.json(response);
    }
  } catch (error) {
    res.json({ "Error": `Something went wrong : ${error}` });
  }
});

/* Update user by Id */
router.put('/update/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const loadValue = req.body;
    let { name, userName, bio, location, website, dateOfBirth } = loadValue;
    console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

    if (!(name, userName, dateOfBirth)) {
      res.status(400).json({ "Error": "Incomplete or invalid data. Please provide all required information." });
    }
    bio = bio ? bio : null;
    location = location ? location : null;
    website = website ? website : null;
    document = { 'name': name, "userName": userName, "bio": bio, "location": location, "website": website, "dateOfBirth": dateOfBirth };
    const response = await userController.updateUserById(userId, document);
    if (response) {
      console.log(`Updated Document is: [${JSON.stringify(response)}]`);
    }
    res.json(response);
  } catch (error) {
    res.json({ "Error": `Something went wrong : ${error}` });
  }
});

/* Delete user by Id */
router.delete('/delete/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const response = await userController.deleteUserById(userId);
    if (response) {
      console.log(`Deleted Document is: [${JSON.stringify(response)}]`);
      res.json(
        {
          msg: `User with Id# ${response._id} has been deleted`,
          response: response
        }
      );
    }
    else {
      res.json({ "msg": `User not found with id# : ${userId}` });
    }
  } catch (error) {
    res.json({ "Error": `Something went wrong : ${error}` });
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer; // Buffer containing the uploaded image
    const response = await userController.uploadProfilePic(imageBuffer);
    if (response) {
      console.log('Inserted document with ID:', response.insertedId);
      res.json(response);
    }
  } catch (error) {
    res.json({ "Error": `Something went wrong : ${error}` });
  }
});

/* View All Followers */
router.get('/allFollower', async (req, res, next) => {
  const userId = req.decoded.userId;
  const connectionName = 'following';
  try {
    const result = await userController.getConnections(userId, connectionName);
    res.json(result);
  } catch (error) {
    return ({ "Error in All follower": `${error}` });
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
    return ({ "Error": `${error}` });
  }
});

/* GET user by Id. */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log(`Get user by id start with the Request: ${userId}`);
    if (!userId) {
      res.status(400).json({ "Error": "Incomplete or invalid data. Please provide all required information." }
      );
    }
    const filter = { '_id': new ObjectId(userId) };
    console.log(`Filter: ${JSON.stringify(filter)}`);
    const response = await userController.getUserByField(filter);
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ "Error": 'User not found' });
    }
  } catch (error) {
    res.json({ "Error": `Something went wrong with productId: ${error}` });
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
    return ({ "Error": `${error}` });
  }
});


module.exports = router;
