const database = require('../../private/database/connectDb');
const { ObjectId } = require('mongodb');
const db = database.getDbClient();

const getUserFeed = async (userId) => {
    try {
        if (!userId || !ObjectId.isValid(userId)) return { response: 'userId is missing', statusCode: 500 };
        const feedRes = await db
            .collection('users')
            .aggregate([
                {
                    $match: { _id: new ObjectId(userId) },
                },
                {
                    $lookup: {
                        from: 'xTweets',
                        localField: 'following',
                        foreignField: 'userId',
                        as: 'result',
                    },
                },
                {
                    $unwind: '$result',
                },
                {
                    $project: { result: 1 },
                },
                {
                    $sort: { 'result.createdAt': -1 },
                },
            ])
            .toArray();
        console.log(`All Saved Flock is : ${JSON.stringify(feedRes)}`);
        if (feedRes) return { response: feedRes, statusCode: 200 };
        else return { response: `No saved file`, statusCode: 400 };
    } catch (error) {
        return { response: `Exception in get All flock : ${error}`, statusCode: 500 };
    }
};
module.exports = {
    getUserFeed,
};
