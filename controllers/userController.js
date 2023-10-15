const bcrypt = require('bcrypt');
const database = require('../private/database/connectDb');
const { ObjectId } = require("mongodb");

const db = database.getDbClient();
const getAllUsers = async () => {
  try {
    const response = await db.collection('users').find().toArray();
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

const getUserByField = async (filter) => {
  try {
    const response = await db.collection('users').findOne(filter);
    console.log(`Function getUserByField Ended with response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

const createNewUser = async (document) => {
  try {
    const password = await bcrypt.hash(document.password, 10);
    document.password = password;

    const response = await db.collection('users').insertOne(document);
    if (response) {
      console.log('Inserted document with ID:', response.insertedId);
    }
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

const updateUserById = async (userId, document) => {
  try {
    const query = { _id: new ObjectId(userId) };
    const updateDoc = { $set: document };
    const response = await db.collection('users').findOneAndUpdate(query, updateDoc, { returnNewDocument: "true" });
    if (response) {
      console.log(`Updated Document is: [${JSON.stringify(response)}]`);
    }
    return response;
  } catch (error) {
    return ({ "Error": `Something went wrong : ${error}` });
  }
}

const deleteUserById = async (userId) => {
  try {
    query = { _id: new ObjectId(userId) };
    const response = await db.collection('users').findOneAndDelete(query);
    if (response) {
      console.log(`Deleted Document is: [${JSON.stringify(response)}]`);
      return response;
    }
    else {
      return ({ "msg": `User not found with id# : ${userId}` });
    }
  } catch (error) {
    return ({ "Error": `Something went wrong : ${error}` });
  }
}

const uploadProfilePic = async (imageBuffer) => {
  try {
    const response = await db.collection('users').insertOne({ image: imageBuffer });
    if (response) {
      console.log(`Image Uploaded: [${JSON.stringify(response)}]`);
      return response;
    }

  } catch (error) {
    return ({ "Error": `Something went wrong : ${error}` });
  }
}

const addFollow = async (followId, userId) => {
  if (!(followId, userId)) {
    res.status(400).json(
      { "Error": "Incomplete or invalid data. Please provide all required information." }
    );
  }
  followId = new ObjectId(followId);
  userId = new ObjectId(userId);
  console.log(`Follow id : [${followId}] \n Follower id : [${userId}]`);

  try {
    const followerRes = await db.collection('users').findOneAndUpdate({ _id: userId }, { $push: { following: followId } }, { returnNewDocument: "true" });
    const followingRes = await db.collection('users').findOneAndUpdate({ _id: followId }, { $push: { followers: userId } }, { returnNewDocument: "true" });
    result = { userResponse: followerRes, followerResponse: followingRes };
    return result;
  } catch (error) {
    return ({ "Error": `Error in add follow : ${error}` });
  }
}

const allFollowers = async (userId) => {
  userId = new ObjectId(userId);
  try{
    const followerRes = await db.collection('users').findOne({ _id:  userId },{following: 1, _id: 0});
    return followerRes;
  }catch(error){
    return ({ "Error": `Error in list all followers : ${error}` });
  }
}

module.exports = {
  getAllUsers,
  getUserByField,
  createNewUser,
  updateUserById,
  deleteUserById,
  uploadProfilePic,
  addFollow,
  allFollowers
}