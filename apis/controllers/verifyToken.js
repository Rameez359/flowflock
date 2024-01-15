const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();

const secret_key = process.env.SECRET_KEY;

passport.use(
    new GoogleStrategy(
        {
            clientID: '670066915033-oqil69hb9up03plshaa2p1b7egpf353c.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/signupwithGoogle/callback',
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
