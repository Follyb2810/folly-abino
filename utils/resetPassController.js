const nodemailer = require('nodemailer');
require('dotenv').config();
const {getUserByEmail,randomResetCode} = require ("./usefulFunctions");
const User = require ('../model/User');
const Cache = require('js-cache');
const jwt = require('jsonwebtoken');

// Create a new cache instance - holds 5 minute long password reset codes.
const cache = new Cache();

const sendResetMail = (email) =>{
    const resetCode = randomResetCode();

    // Create a nodemailer transporter using environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.EMAIL_SECRET, // Retrieve email user from environment variable
        pass: process.env.EMAIL_PASS_SECRET, // Retrieve email password from environment variable
        },
    });
    
    // Compose the email
    const mailOptions = {
        from: process.env.EMAIL_SECRET, // Use the same email user as the sender
        to: email, // Recipient's email address
        subject: 'Reset your password!',
        text: `Hello,\n The code to reset your password is: ${resetCode}.\n The code is available for only 5 minutes.`,
    };
    
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return -1;
        } else {
            cache.set(email, resetCode,300000);
            return resetCode;
        }
    });
}


const resetPassword = async (req,res) => {
    if(!req.body?.email) return res.status(404).json({"message": "Email is required!"});
    const email = req.body.email;
    try {
        const foundUser = await getUserByEmail(email);
        if(!foundUser) return res.status(404).json({"message": "User not found"});

        sendResetMail(email);
        return res.json({"message": "Email sent!"});
    }
    catch (err){
        return res.status(400).json({"message": err.message});
    }
}

const getCode = async (req,res) => {
    const email = req.params.email;
    const foundUser = await getUserByEmail(email);
    const code = cache.get(email);

    //create jwts:
    //access token:
    const accessToken = jwt.sign(
        {
            "UserInfo" : {
                "username": foundUser.username
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
    );
    return res.status(201).json({
        username: foundUser.username,
        code: code,
        accessToken: accessToken
    })
}

module.exports = {resetPassword, getCode};