const bcrypt = require('bcrypt');
const database = require('../private/database/connectDb');
const { ObjectId } = require("mongodb");

const client = database.getClient();

const getAllUsers = async ()=> {
  try{
      const collection = client.db('xTwitter').collection('users'); 
      const response = await collection.find().toArray();
      return response;
  }catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
}

const getUserByField = async (filter)=>{
  try{
      const response = await client.db('xTwitter').collection('users').findOne(filter);
      console.log(`Function getUserByField Ended with response: ${JSON.stringify(response)}`);
      return response;
    }catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
}

const createNewUser = async (document)=>{
  try{
    console.log(`Function createNewUser start with request : [${JSON.stringify(document)}]`);
    const password = await bcrypt.hash(document.password, 10);
    document.password = password;

    const response = await client.db('xTwitter').collection('users').insertOne(document);
    if(response){
      console.log('Inserted document with ID:', response.insertedId);
    }
    return response;
  }catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

const updateUserById = async (userId, document)=>{
  try{
    const query = {_id:new ObjectId(userId)};
    const updateDoc = { $set: document};
    const response = await client.db('xTwitter').collection('users').findOneAndUpdate(query,updateDoc,{returnNewDocument: "true"});
    if(response){
      console.log(`Updated Document is: [${JSON.stringify(response)}]`);
    }
    return response;
  }catch(error){
    return({"Error":`Something went wrong : ${error}`});
  }
}
const deleteUserById = async (userId)=>{
  try{
    query = {_id:new ObjectId(userId)};
    const response = await client.db('xTwitter').collection('users').findOneAndDelete(query);
    if(response){
      console.log(`Deleted Document is: [${JSON.stringify(response)}]`);
      return response;
    }
    else{
      return({"msg":`User not found with id# : ${userId}`});
    }
  }catch(error){
    return({"Error":`Something went wrong : ${error}`});
  }
}

const uploadProfilePic = async (imageBuffer)=>{
  try{
    const response = await client.db('xTwitter').collection('users').insertOne({ image: imageBuffer });
    if(response){
      console.log(`Image Uploaded: [${JSON.stringify(response)}]`);
      return response;
    }
  }catch(error){
    return({"Error":`Something went wrong : ${error}`});
  }
}
module.exports = {
  getAllUsers,
  getUserByField,
  createNewUser,
  updateUserById,
  deleteUserById,
  uploadProfilePic
}