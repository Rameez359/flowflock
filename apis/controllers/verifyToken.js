const jwt = require('jsonwebtoken');
const database = require('../../private/database/connectDb');
const { returnRes, sendMail, generateCode } = require('./commonController');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const db = database.getDbClient();

const secret_key = process.env.SECRET_KEY;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }

    jwt.verify(token, secret_key, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.decoded = decoded;
        next();
    });
};

const localSignupStepOne = async (req, res, next) => {
    console.log(`Local SignUp body start with request : [${JSON.stringify(req.body)}]`);

    const { name, email, dateOfBirth } = req.body;
    if (!(name && email && dateOfBirth)) returnRes('Incomplete Information','FALSE', 400, res);

    const newUser = req.body;
    const date = new Date();
    newUser.createdAt = date;
    newUser.updatedAt = date;

    const verificationCode = generateCode();
    newUser.verificationCode = verificationCode;
    const userResp = await db.collection('NewUsers').insertOne(req.body);
    console.log(`New Temporary User Request Ended with Response: [${JSON.stringify(userResp)}`);

    if (userResp) {
        const mailOptions = {
            from: 'alirameez359@gmail.com',
            to: email,
            subject: 'Verification of FlowFlock Account',
            text: `This is a verification email from FlowFlock. Please verify your account by entering the given code. \n ${verificationCode}`,
        };

        const sendmail = sendMail(mailOptions);
        const data = {
            msg: `Verification code has been sent to user's Gmail account`,
            userId: userResp.insertedId,
        };
        if (sendmail) returnRes(data, 'TRUE', 200, res);
        else returnRes('Something went wrong in sending gmail to user','FALSE', 400, res);
    } else returnRes('Something went wrong in inserting user','FALSE', 400, res);
};

const localSignupStepTwo = async (req, res, next) => {
    console.log(`Verify Account body start with request : [${JSON.stringify(req.body)}]`);

    const { userId, code } = req.body;
    const user = await db.collection('NewUsers').findOne({ _id: new ObjectId(userId) });
    if (!user) returnRes('User not found','FALSE', 400, res);

    if (user.verificationCode === parseInt(code)) {
        await db
            .collection('NewUsers')
            .findOneAndUpdate({ _id: userId }, { $set: { status: 'APPROVED' } }, { returnNewDocument: 'true' });
        returnRes('User has been verified successfully','TRUE', 200, res);
    } else returnRes('Invalid Verification Code','FALSE', 400, res);
};

const localSignupStepThree = async (req, res, next) => {
    console.log(`Create username start with request : [${JSON.stringify(req.body)}]`);

    const { username, userId } = req.body;
    console.log(`UserID is: ${userId}`);
    if (!(username && userId)) returnRes('Please send all required params','FALSE', 400, res);

    const userData = await db.collection('NewUsers').findOne({ _id: new ObjectId(userId) });
    console.log(`User Data Ended with Response: [${JSON.stringify(userData)}`);
    if (!userData) returnRes('User not found','FALSE', 400, res);

    const newUser = {
        name: userData.name,
        username: username,
        email: userData.email,
        dateOfBirth: userData.dateOfBirth,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
    };

    const userResp = await db.collection('users').insertOne(newUser);
    await db.collection('newUser').deleteOne({ _id: new ObjectId(userId) });

    if (!userResp.insertedId) returnRes('Something went wrong in creating new user','FALSE', 400, res);
    const mailOptions = {
        from: 'alirameez359@gmail.com',
        to: newUser.email,
        subject: 'Welcome to Flow Flock',
        text: `Thanks for creating your account on Flow Flock. Your account has been created with the username ${username}`,
    };
    const sendmail = sendMail(mailOptions);
    if (sendmail) returnRes('User has been created successfully','TRUE', 201, res);
};

const checkDuplicateUsername = async (req, res, next) => {
    console.log(`Create username start with request : [${JSON.stringify(req.body)}]`);
    const { username } = req.body;

    const checkUsername = await db.collection('users').findOne({username: username});
    if(checkUsername) returnRes('Username already found','FALSE', 200, res);
    else returnRes('No username found','TRUE', 200, res);
};
module.exports = { verifyToken, localSignupStepOne, localSignupStepTwo, localSignupStepThree, checkDuplicateUsername };
