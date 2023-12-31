var express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
var router = express.Router();
const userController = require('../controllers/userController');
require('dotenv').config();

const secret_key = process.env.SECRET_KEY;

/* GET home page. */
router.get('/', userController.renderHome);
router.get('/abc', async function (req, res, next) {
    console.log('abc');
    const secretKey = 'bayqi-secret';
    // pin = '1122';
    // const pinCode = CryptoJS.AES.encrypt(pin, 'bayqi-secret').toString();
    // console.log(pinCode);
    // Decrypt the password
    const decryptedBytes = CryptoJS.AES.decrypt('U2FsdGVkX1+SWzg78Hjs9XN2e+I7C6kOjOzZbJnjyTw=', secretKey);
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

module.exports = router;
