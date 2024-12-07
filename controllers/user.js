// Import required modules
const User = require("../models/User"); // User model for database operations
const bcrypt = require("bcrypt"); // For password hashing
const jwt = require("jsonwebtoken"); // For generating tokens
const sendMail = require("../middleware/sendMail"); // For sending email

// Function to handle user registration
exports.register = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Temporarily store user data for OTP verification
        const newUser = {
            name,
            email,
            password: hashedPassword,
        };

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Create an activation token containing the user data and OTP
        const activationToken = jwt.sign(
            { user: newUser, otp },
            process.env.JWT_SECRET,
            { expiresIn: "1hr" } // Token valid for 5 minutes
        );

        // Prepare and send OTP email
        const emailData = { name, otp };
        await sendMail(email, "E-learning OTP Verification", emailData);

        // Respond with success and the activation token
        res.status(200).json({
            success: true,
            message: "OTP sent to your email",
            activationToken,
        });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};




// VERIFY USER
exports.verifyUser = async (req, res) => {
    try {
        const { otp, activationToken } = req.body;

        // Verify the activation token
        const decoded = jwt.verify(activationToken, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: "Token expired or invalid",
            });
        }

        // Check if the OTP matches
        if (decoded.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Wrong OTP",
            });
        }

        // Create the user in the database using the data from the token
        const { name, email, password } = decoded.user;
        const user = await User.create({ name, email, password });

        return res.status(200).json({
            success: true,
            message: "User successfully registered",
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred during verification. Please try again.",
        });
    }
};




// LOGIN USER

exports.loginUser = async(req, res) => {

    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.json({
                message:"No user With this email"
            })
        }

        if(!email || !password){
            res.json({
                message:"Enter correct Password"
            })
        }

        const userPassword = await bcrypt.compare(password, user.password);

        if(!userPassword){
            req.json({
                message:"Wrong Password"
            })
        }

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET,{
            expiresIn:"1hr"
        })

        res.json({
            message:`Welcome back ${user.name}`,
            token,
            user
        })
    }
    catch(error){
        res.json({
            message:"Error in logIn"
        })
    }
}

exports.myProfile = async(req, res) => {
    try{
        const user = await User.findById(req.user._id)
        res.json({
            user
        })
    }
    catch(error){
        res.json({
            message:"profile me dikkat"
        })
    }
}