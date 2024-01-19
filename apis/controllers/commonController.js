const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();

    const clientId = '670066915033-oqil69hb9up03plshaa2p1b7egpf353c.apps.googleusercontent.com';
    const clientSecret = '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';
    const refreshToken = 'YOUR_REFRESH_TOKEN';

    const createTransporter = async () => {
        const oauth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            'https://developers.google.com/oauthplayground'
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN,
        });

        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject();
                }
                resolve(token);
            });
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                accessToken,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
            },
        });

        return transporter;
    };

exports.sendMail = async (mailOption) => {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(mailOption);
  };
exports.generateCode = () => {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.returnRes = (data, statusCode, res) => {
    res.status(statusCode).json({
        response: data,
        statusCode: statusCode
    });
};
