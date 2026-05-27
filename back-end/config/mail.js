const path = require('path');
const nodemailer = require("nodemailer");

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.app_password || process.env.APP_PASSWORD;

if (!emailUser || !emailPass) {
  throw new Error('Email credentials are missing. Set EMAIL_USER and EMAIL_PASS or app_password in back-end/.env');
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass, // App password (NOT your Gmail password)
  },
});

module.exports = transporter;