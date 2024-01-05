const mongoose = require('mongoose');
const User = require('./../model/RegisterModel');
const { HashPassword, ComparePassword } = require('../utils/bycrypt');
const { JsonSignToken, JsonVerifyToken } = require('../utils/Jwt');

const SignUp = async (req, res) => {
    try {
        const { username, Age, location, skin, image, email, password } = req.body;

        // Check if the user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Validate required fields
        if (!username || !Age || !skin || !email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide all required details' });
        }

        // Hash the password
        const hashPwd = await HashPassword(password);

        // Create a new user
        const newUser = await User.create({
            username, Age, location, skin, image, email, password: hashPwd,
        });

        // Prepare user data for response
        const createdUser = {
            username: newUser.username,
            Age: newUser.Age,
            skin: newUser.skin,
            email: newUser.email,
            image: newUser.image,
            location: newUser.location,
        };

        // Send success response
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: { user: createdUser },
        });
    } catch (error) {
        // Handle errors
        console.error('Error during registration:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await User.findOne({ email }).select('+password');

        if (!userExist) {
            return res.status(401).json({
                status: 'fail',
                message: 'User does not exist',
            });
        }

        const match = await ComparePassword(password, userExist.password);
        if (!match) return res.status(400).json({ message: 'Invalid credentials' });

        if (match) {
            const accessToken = JsonSignToken({
                id: userExist._id,
                email: userExist.email,
            }, '15m');
            const refreshToken = JsonSignToken({
                id: userExist._id,
                email: userExist.email,
            }, '7d');
            const expirationTimeRefresh = new Date();
            expirationTimeRefresh.setHours(expirationTimeRefresh.getHours() + 7);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                expires: expirationTimeRefresh,
            });

            userExist.refreshToken = refreshToken;
            await userExist.save();

            return res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: { userId: userExist._id, accessToken, refreshToken },
            });
        } else {
            return res.status(401).json({
                status: 'fail',
                message: 'Your email and password are wrong',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

const RefreshUser = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Please Login again' });
        }

        const foundUser = await User.findOne({ refreshToken }).exec();

        if (!foundUser) {
            return res.status(401).json({ message: 'Not Authorized' });
        }

        const newAccessToken = JsonSignToken({ id: foundUser._id, email: foundUser.email }, '10s');
        res.json({ newAccessToken });

        next();
    } catch (error) {
        console.error('Authentication failed', error.message);
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const protectedRoutes = async (req, res, next) => {
    try {
        const token = req.headers.authorization || req.headers.Authorization;
                // const token = req.header('x-auth-token');
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'You have not logged in' });
        }

        const accessToken = token.split(' ')[1];
        const decoded = JsonVerifyToken(accessToken);

        req.email = decoded.email;
        req._id = decoded.id;

        next();
    } catch (error) {
        console.error('Authentication failed', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const UpdateUser = async (req, res, next) => {
    try {
        const { username, Age, location, skin, image, email } = req.body;
        const { userId } = req.params; 
        const getUser = await User.findOne({ _id: userId }); 

        if (!getUser) {
            return res.status(404).json({ message: `User with ID ${userId} not found` }); 
        }

        if (username || Age || location || skin || email) {
            const updateUser = await User.findOneAndUpdate(
                { _id: userId }, 
                { $set: { username, Age, location, skin, email } },
                { new: true } 
            );

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: { updateUser },
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: 'No valid update fields provided',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};
const ForgetPassword =async (req, res, next) => {
    try {
        // const { userId } = req.query;
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required in query parameters' });
        }

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the current password matches
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Send a confirmation email using Nodemailer
        const transporter = nodemailer.createTransport({
            // configure your mail server details here
            // ...
        });

        const mailOptions = {
            from: 'your-email@example.com',
            to: user.email,
            subject: 'Password Changed',
            text: 'Your password has been changed successfully.',
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const Logout = async(req,res,next)=>{
   try {
     const cookies = req.cookies
    if(!cookies?.refreshToken) return res.sendStatus(204)
     const token = cookies.refreshToken
     if (!token) {
        return res.sendStatus(204);
    }

    const user = await User.findOne({ refreshToken: token }).exec();

    if (user) {
        // Clear the refreshToken in the database
        user.refreshToken = '';
        await user.save();

        // Clear the refreshToken cookie
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true, maxAge: 0 });

        return res.sendStatus(204);
    }

    // If the user is not found, you might want to handle it appropriately
    // For example, you can log an error or send a specific status code
    throw new Error('User not found or error in clearing cookies');
     res.clearCookie('jwt',{ httpOnly: true,sameSite:'None',secure: true }) //! secure:true ---only in https
     res.sendStatus(204)
   } catch (error) {
    
   }
}





const getFolly = async (req, res) => {
    res.send('hello folly');
};

module.exports = {
    SignUp, getFolly, SignIn, RefreshUser, protectedRoutes,UpdateUser,ForgetPassword,Logout
};
