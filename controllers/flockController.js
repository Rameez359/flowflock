const database = require('../private/database/connectDb');
const { ObjectId } = require("mongodb");
const db = database.getDbClient();

const createFlock = async (userId, payload) => {
    try {
        let content;
        let hashtTags;
        if (payload) {
            content = (payload.content ? payload.content : '');
            hashtTags = (payload.hashTags ? payload.hashTags : []);
        }
        console.log(`Flock HashTags: [${JSON.stringify(hashtTags)}]`);
        if (!content) {
            return {'Error':'Flock body is empty'}
        }
        const insertObj = {
            userId: new ObjectId(userId),
            content: content,
            hashtTags: hashtTags,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const flockResponse = await db.collection('xTweets').insertOne(insertObj);
        return flockResponse;
    } catch (error) {
        console.error('Error creating flock:', error);
        throw error;
    }
}

const addFlockComment = async (userId, payload) => {
    try {
        let comment;
        let flockId;
        if (payload) {
            flockId = payload.flockId || '';
            comment = payload.comment || '';
        }
        if (!(flockId && comment)) {
            return { 'Error': "Invalid flockId or comment" };
        }
        const insertedObj = {
            flockId: new ObjectId(flockId),
            comment: comment,
            createdAt : new Date(),
            updatedAt : new Date()
        }
        const commentResp = await db.collection('comments').insertOne(insertedObj);
        return commentResp;
    } catch (error) {
        return { 'Exception': `Exception in add flock comment : ${error}` };
    }
}


module.exports = {
    createFlock,
    addFlockComment
}