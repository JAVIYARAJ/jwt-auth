const nodemailer = require('nodemailer');
require('dotenv').config();

const emailTranspoter = nodemailer.createTransport(
    {
        host: "javiyaraj4@gmail.com",
        service: "gmail",
        auth: {
            user: "javiyaraj4@gmail.com",
            pass: "ojeivwbddoididtl"
        }
    }
)

module.exports = emailTranspoter;