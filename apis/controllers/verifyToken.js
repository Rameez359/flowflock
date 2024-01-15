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
        function (req, accessToken, refreshToken, profile, done) {
            console.log(profile);

            done(err, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});

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

const signupWithGoogle = (req, res, next) => {
    passport.authenticate('google', { scope: ['email', 'profile'] });
};

module.exports = { verifyToken, signupWithGoogle };
