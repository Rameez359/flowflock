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
            return { 'Error': 'Flock body is empty' }
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
            return { 'response': "Invalid flockId or comment", statusCode: 400 };
        }
        const insertedObj = {
            flockId: new ObjectId(flockId),
            userId: new ObjectId(userId),
            comment: comment,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const commentResp = await db.collection('comments').insertOne(insertedObj);
        return { response: commentResp, statusCode: 200 };
    } catch (error) {
        return { 'response': `Exception in add flock comment : ${error}`, statusCode: 500 };
    }
}

const showFlockComments = async (payload) => {
    try {
        let flockId;
        let pipeline = [];
        if (payload) {
            flockId = payload.flockId || '';
        }
        if (!flockId) {
            return { 'response': "Invalid flockId", statusCode: 400 };
        }
        flockId = new ObjectId(flockId);
        console.log(`flockId response : ${JSON.stringify(flockId)}`);
        pipeline.push({
            $match: {
                "flockId": flockId
            }
        },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetail"
                }
            },
            {
                $unwind: {
                    path: "$userDetail"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    comment: { "$first": "$comment" },
                    createdAt: { "$first": "$createdAt" },
                    userId: { "$first": "$userDetail._id" },
                    name: { "$first": "$userDetail.name" },
                    userName: { "$first": "$userDetail.userName" },
                }
            });
        const commentsResp = await db.collection('comments').aggregate(pipeline).toArray();
        pipeline.push({ $count: "total_comments" });
        const commentsCount = await db.collection('comments').aggregate(pipeline).toArray();
        const response = { results: commentsResp, count: commentsCount[0].total_comments };
        return { response: response, statusCode: 200 };
    } catch (error) {
        return { 'response': `Exception in show all flock comments : ${error}`, statusCode: 500 };
    }
}

const addFlockLike = async (userId, payload) => {
    try {
        let flockId;
        if (payload) {
            flockId = payload.flockId || '';
        }
        if (!(flockId)) {
            return { 'response': "Invalid flockId", statusCode: 400 };
        }
        flockId = new ObjectId(flockId);
        userId = new ObjectId(userId);

        const likeResp = await db.collection('xTweets').findOneAndUpdate(
            { '_id': flockId },
            {
                $push: { 'likeBy': userId },
                $inc: { 'totalLike': 1 }
            },
            { returnNewDocument: "true" }
        );
        if (likeResp)
            return { statusCode: 204 };
        else
            return { 'response': 'Invalid flockId', statusCode: 400 };
    } catch (error) {
        return { 'response': `Exception in add like on flock : ${error}`, statusCode: 500 };
    }

}

const saveFlock = async (userId, payload) => {
    try {
        let flockId;
        if (payload) {
            flockId = payload.flockId || '';
        }
        if (!(flockId)) {
            return { 'response': "Invalid flockId", statusCode: 400 };
        }
        flockId = new ObjectId(flockId);
        userId = new ObjectId(userId);
        const saveResp = await db.collection('users').findOneAndUpdate(
            { '_id': userId },
            { $push: { 'savedFlock': flockId } },
            { returnNewDocument: "true" }
        );
        if (saveResp)
            return { statusCode: 204 };
        else
            return { 'response': "User not exist.", statusCode: 400 };
    } catch (error) {
        return { 'response': `Exception in saving flock : ${error}`, statusCode: 500 };
    }
}

const viewSavedFlock = async (userId) => {
    try {
        if (!userId) return { 'response': "userId is missing", statusCode: 400 }
        console.log(`user id is : ${userId}`);
        userId = new ObjectId(userId);
        const savedFlock = await db.collection('users').aggregate([
            {
                $match: { '_id': userId }
            },
            {
                $lookup: {
                    from: 'xTweets',
                    localField: 'savedFlock',
                    foreignField: '_id',
                    as: 'myItems'
                }
            },
            {
                $project: {
                    _id: 0,
                    'myItems': 1
                }
            }
        ]).toArray();
        console.log(`Saved Flock is : ${JSON.stringify(savedFlock[0].myItems)}`);
        if (savedFlock)
            return { 'response': savedFlock[0].myItems, statusCode: 200 };
        else
            return { 'response': `User not exist`, statusCode: 400 };
    } catch (error) {
        return { 'response': `Exception in saving flock : ${error}`, statusCode: 500 };
    }
}

module.exports = {
    createFlock,
    addFlockLike,
    addFlockComment,
    showFlockComments,
    saveFlock,
    viewSavedFlock
}