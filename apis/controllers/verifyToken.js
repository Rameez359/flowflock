const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();

const secret_key = process.env.SECRET_KEY;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL

console.log(`${clientID} \n ${clientSecret} \n ${callbackURL} \n `)
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
    return { id: id, /* other user properties */ };
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

const localSignupStepOne = (req, res, next) => {
    console.log(`Local SignUp body start with request : [${JSON.stringify[req.body]}]`);
    const { name, email, dateOfBirth } = req.body;
}

const signupWithGoogle = (req, res, next) => {
    passport.authenticate('google', { scope: ['email', 'profile'] });
};

module.exports = { verifyToken, signupWithGoogle };
