const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const database = require('../../private/database/connectDb');
const { returnRes, sendMail, generateCode } = require('./commonController');
require('dotenv').config();

const db = database.getDbClient();

const secret_key = process.env.SECRET_KEY;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;

passport.use(
    new GoogleStrategy(
        {
            clientID: clientID,
            clientSecret: clientSecret,
            callbackURL: callbackURL,
            passReqToCallback: true,
        },
        (req, accessToken, refreshToken, profile, done) => {
            // Note: 'err' should be replaced with 'null' to avoid a reference error
            console.log(profile);

            // Pass the user data to the next middleware or route handler
            done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    // Use a unique identifier from the user profile (like user ID) for serialization
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Retrieve user information from the database based on the serialized user ID
    // Replace the following line with your actual database query logic
    const user = findUserById(id);

    // Note: Handle errors appropriately
    done(null, user);
});

// Example function to find a user by ID (replace this with your database logic)
function findUserById(id) {
    // Your database query logic goes here
    // Return user information based on the provided ID
    return { id: id /* other user properties */ };
}
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
    if (!(name && email && dateOfBirth)) returnRes('Incomplete Information', 400, res);

    const newUser = req.body;
    const date = new Date();
    newUser.createdAt = date;
    newUser.updatedAt = date;

    const verificationCode = generateCode();
    newUser.verificationCode = verificationCode;
    const userResp = await db.collection('NewUsers').insertOne(req.body);

    if (userResp) {
        const mailOptions = {
            from: 'alirameez820@gmail.com',
            to: email,
            subject: 'Verification of FlowFlock Account',
            text: `This is a verification email from FlowFlock. Please verify your account by entering the given code. \n ${verificationCode}`,
        };

        const sendmail = sendMail(mailOptions);

        if (sendmail) returnRes('Verification code has been sent to user Gmail account', 200, res);
        else returnRes('Something went wrong in sending gmail to user', 400, res);
    } else returnRes('Something went wrong in inserting user', 400, res);
};

const localSignupStepTwo = async (req, res, next) => {
    console.log(`Verify Account body start with request : [${JSON.stringify(req.body)}]`);

    const { userId, code } = req.body;
    const user = await db.collection('NewUsers').findOne({ _id: userId });
    if (!user) returnRes('User not found', 400, res);

    if (user.verificationCode === code) {
        const updateUser = await db
            .collection('NewUsers')
            .findOneAndUpdate({ _id: userId }, { $set: { status: 'APPROVED' } }, { returnNewDocument: 'true' });
        returnRes('User has been verified successfully', 200, res);
    } else returnRes('Invalid Verification Code', 400, res);
};
module.exports = { verifyToken, localSignupStepOne, localSignupStepTwo };
