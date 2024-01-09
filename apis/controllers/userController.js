const bcrypt = require('bcrypt');
const database = require('../../private/database/connectDb');
const { ObjectId } = require('mongodb');

const db = database.getDbClient();

exports.renderHome = async (req, res, next) => {
    try {
        res.render('index');
    } catch (error) {
        console.log('Unexpected error!');
        res.status(500).json({
            error: {
                message: 'Unable to render home page.',
                err: JSON.stringify(err),
            },
        });
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const response = await db.collection('users').find().toArray();
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

exports.getUserByField = async (filter) => {
    try {
        const response = await db.collection('users').findOne(filter);
        // console.log(`Function getUserByField Ended with response: ${JSON.stringify(response)}`);
        return response;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

exports.createNewUser = async (req, res, next) => {
    try {
        const loadValue = req.body;
        const jsonData = JSON.parse(loadValue.json_data);
        const image = req.file.buffer;
        let { name, userName, bio, location, website, dateOfBirth, password } = jsonData;
        console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

        if (!(name, userName, dateOfBirth, password)) {
            res.status(400).json({ Error: 'Incomplete or invalid data. Please provide all required information.' });
        }

        bio = bio ? bio : null;
        location = location ? location : null;
        website = website ? website : null;

        password = await bcrypt.hash(password, 10);
        document = {
            name: name,
            userName: userName,
            bio: bio,
            location: location,
            website: website,
            dateOfBirth: dateOfBirth,
            password: password,
            profilePic: image,
        };

        const response = await db.collection('users').insertOne(document);
        if (response) {
            console.log('Inserted document with ID:', response.insertedId);
        }
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

exports.updateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const loadValue = req.body;
        let { name, userName, bio, location, website, dateOfBirth } = loadValue;
        console.log(`Request Body is: [${JSON.stringify(loadValue)}]`);

        if (!(name, userName, dateOfBirth)) {
            res.status(400).json({ Error: 'Incomplete or invalid data. Please provide all required information.' });
        }
        bio = bio ? bio : null;
        location = location ? location : null;
        website = website ? website : null;
        document = {
            name: name,
            userName: userName,
            bio: bio,
            location: location,
            website: website,
            dateOfBirth: dateOfBirth,
        };
        const query = { _id: new ObjectId(userId) };
        const updateDoc = { $set: document };
        const response = await db.collection('users').findOneAndUpdate(query, updateDoc, { returnNewDocument: 'true' });
        if (response) {
            console.log(`Updated Document is: [${JSON.stringify(response)}]`);
        }
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

exports.deleteUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        query = { _id: new ObjectId(userId) };
        const response = await db.collection('users').findOneAndDelete(query);
        if (response) {
            console.log(`Deleted Document is: [${JSON.stringify(response)}]`);
            res.json(response);
        } else {
            res.json({ msg: `User not found with id# : ${userId}` });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

const addFollow = async (followId, userId) => {
    try {
        if (!(followId, userId)) {
            res.status(400).json({ Error: 'Incomplete or invalid data. Please provide all required information.' });
        }
        followId = new ObjectId(followId);
        userId = new ObjectId(userId);
        console.log(`Follow id : [${followId}] \n Follower id : [${userId}]`);

        const followerRes = await db
            .collection('users')
            .findOneAndUpdate({ _id: userId }, { $push: { following: followId } }, { returnNewDocument: 'true' });
        const followingRes = await db
            .collection('users')
            .findOneAndUpdate({ _id: followId }, { $push: { followers: userId } }, { returnNewDocument: 'true' });
        result = { userResponse: followerRes, followerResponse: followingRes };
        return result;
    } catch (error) {
        return { Error: `Error in add follow : ${error}` };
    }
};

//Common Function
const getConnections = async (userId, connectionName) => {
    userId = new ObjectId(userId);
    try {
        const followerRes = await db
            .collection('users')
            .aggregate([
                {
                    $match: { _id: userId },
                },
                {
                    $project: {
                        _id: 0,
                        [connectionName]: 1,
                    },
                },
            ])
            .toArray();

        return followerRes;
    } catch (error) {
        return { Error: `Error in connections : ${error}` };
    }
};
// module.exports = {
//     getAllUsers,
//     getUserByField,
//     createNewUser,
//     updateUserById,
//     deleteUserById,
//     uploadProfilePic,
//     addFollow,
//     getConnections,
// };
