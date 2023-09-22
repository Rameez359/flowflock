var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../controllers/verifyToken');
const { ObjectId } = require("mongodb");
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(verifyToken);
/* GET users listing. */
router.get('/', async (req, res, next)=> {
  try{
    const documents = await userController.getAllUsers();
    res.status(200).json(documents);
  }catch (error) {
    next(error);
  }
});

/* GET user by Id. */
router.get('/:id', async (req, res, next)=>{
  try{
    const userId = req.params.id;
    console.log(`Get user by id start with the Request: ${userId}`);
    if(!userId){
      res.status(400).json({"Error": "Incomplete or invalid data. Please provide all required information."}
      );
    }
    const filter = {'_id':new ObjectId(userId)};
    console.log(`Filter: ${JSON.stringify(filter)}`);
    const response = await userController.getUserByField(filter);
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ "Error": 'User not found' });
    }
  }catch (error) {
    res.json({"Error":`Something went wrong with productId: ${error}`});
  }
});

/* Create new user. */
router.post('/create', async(req, res, next)=>{
  try{
    const loadValue = req.body;
    let {name, userName, bio, location, website, dateOfBirth, password} = loadValue;
    console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

    if(!(name, userName, dateOfBirth, password)){
      res.status(400).json({"Error": "Incomplete or invalid data. Please provide all required information."});
    }

    bio = bio ? bio : null;
    location = location ? location : null;
    website = website ? website : null;
    document = {"name":name,
                "userName":userName,
                "bio":bio, 
                "location":location, 
                "website":website, 
                "dateOfBirth":dateOfBirth, 
                "password":password};
    
    const response = await userController.createNewUser(document);
    if(response){
      console.log('Inserted document with ID:', response.insertedId);
      res.json(response);
    }     
  }catch(error){
    res.json({"Error":`Something went wrong : ${error}`});
  }
});

/* Update user by Id */
router.put('/update/:id', async(req, res, next)=>{
  try{
    const userId = req.params.id;
    const loadValue = req.body;
    let {name, userName, bio, location, website, dateOfBirth} = loadValue;
    console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

    if(!(name, userName, dateOfBirth)){
      res.status(400).json({"Error": "Incomplete or invalid data. Please provide all required information."});
    }
    bio = bio ? bio : null;
    location = location ? location : null;
    website = website ? website : null;
    document = {'name':name, "userName":userName, "bio":bio, "location":location, "website":website, "dateOfBirth":dateOfBirth};
    const response = await userController.updateUserById(userId, document);
    if(response){
      console.log(`Updated Document is: [${JSON.stringify(response)}]`);
    }
    res.json(response);
  }catch(error){
    res.json({"Error":`Something went wrong : ${error}`});
  }
});
/* Delete user by Id */
router.delete('/delete/:id', async(req, res, next)=>{
  try{
    const userId = req.params.id;
    const response = await userController.deleteUserById(userId);
    if(response){
      console.log(`Deleted Document is: [${JSON.stringify(response)}]`);
      res.json(
        {
         msg:`User with Id# ${response._id} has been deleted`,
         response:response
        }
        );
    }
    else{
      res.json({"msg":`User not found with id# : ${userId}`});
    }
  }catch(error){
    res.json({"Error":`Something went wrong : ${error}`});
  }
});
module.exports = router;
