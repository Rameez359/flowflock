var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const passport = require('passport');
const session = require('express-session');

var router = express.Router();
const userController = require('../controllers/userController');
const verifyAccount = require('../controllers/verifyToken');
require('dotenv').config();

const secret_key = process.env.SECRET_KEY;

var userProfile;

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3000/auth/google/callback',
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    )
);

router.get('/signupWithGoogle', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function (req, res) {
        // Successful authentication, redirect success.
        res.redirect('/success');
    }
);

router.get('/success', (req, res) => res.send(userProfile));
router.get('/error', (req, res) => res.send('error logging in'));
/* GET home page. */
router.get('/', userController.renderHome);
router.get('/abc', async function (req, res, next) {
    console.log('abc');
    const secretKey = 'bayqi-secret';
    // pin = '1122';
    // const pinCode = CryptoJS.AES.encrypt(pin, 'bayqi-secret').toString();
    // console.log(pinCode);
    // Decrypt the password
    const decryptedBytes = CryptoJS.AES.decrypt('U2FsdGVkX1/GyCUUOdbewfgeeH6KD0Sbjd2B403crtg=', secretKey);
    const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

    console.log(decryptedPassword);

    res.send('abc');
});

/*Login and Get Token. */
router.post('/login', async (req, res, next) => {
    const { userName, password } = req.body;
    if (!(userName, password)) {
        res.status(400).json({ Error: 'Incomplete or invalid data. Please provide all required information.' });
    }
    try {
        const filter = { userName: userName };
        const userResponse = await userController.getUserByField(filter);
        console.log(`UserResponse start with response : [${JSON.stringify(userResponse)}]`);

        const passwordMatch = await bcrypt.compare(password, userResponse.password);
        console.log(`Password Match :${passwordMatch}`);
        if (!passwordMatch) {
            return res.status(401).json({ Error: 'Invalid username or password' });
        } else {
            const token = jwt.sign({ userId: userResponse._id, userName: userResponse.userName }, secret_key, {
                expiresIn: '24h',
            });
            res.status(200).json({ token });
        }
    } catch (error) {
        res.json({ Error: `Something went wrong : ${error}` });
    }
});

// Create user temporary account.
router.post('/localSignupStepOne', verifyAccount.localSignupStepOne);

// Verify gmail account by verification code.
router.post('/localSignupStepTwo', verifyAccount.localSignupStepTwo);

// Create username.
router.post('/localSignupStepThree', verifyAccount.localSignupStepThree);

// Check duplicate username.
router.post('/checkDuplicateUsername', verifyAccount.checkDuplicateUsername);

// Check duplicate account.
router.get('/checkDuplicateAccount', verifyAccount.checkDuplicateAccount);

module.exports = router;
