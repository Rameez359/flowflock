const database = require('../private/database/connectDb');
const { ObjectId } = require("mongodb");
const db = database.getDbClient();

const createFlock = async (req) => {
    let payload = req.body;
    let content;
    let hashtTags;
    if (payload) {
        content = (payload.content ? payload.content : '');
        hashtTags = (payload.hashTags ? payload.hashTags : []);
    }
    console.log(`Flock HashTags: [${JSON.stringify(hashtTags)}]`);
    const { userId } = req.decoded;
    if (content.length > 0) {
        const insertObj = {
            userId: new ObjectId(userId),
            content: content,
            hashtTags: hashtTags,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        try {
            const flockResponse = await db.collection('xTweets').insertOne(insertObj);
            return flockResponse;
        } catch (error) {
            console.error('Error creating flock:', error);
            throw error;
        }
    }
}

module.exports = {
    createFlock,
}