const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMail = (mailOption, res) => {
    const gmailId = process.env.GMAIL_ID;
    const gmailPassword = process.env.GMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailId,
            pass: gmailPassword,
        },
    });

    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return false;
        } else {
            console.log('Email sent:', info.response);
            return true;
        }
    });
};
exports.generateCode = ()=> {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
exports.returnRes = (data, statusCode, res) => {
    res.status(statusCode).json({
        response: data,
    });
};
