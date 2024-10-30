const express = require('express');
const validateSignUpData = require("../utils/validation");
const bcrypt = require('bcrypt');
const validator = require('validator'); 
const User = require("../models/user");
const authRouter = express.Router();

authRouter.post('/signup', async (req, res)=> {

    try {
        // Validation of data

        validateSignUpData(req);

        // Encrypt the password
        const { password } = req.body;
        if(!validator.isStrongPassword(password)) {
            throw new Error("Your password is weak.Enter a strong one");
        }
        const passwordHash = await bcrypt.hash(password, 9);
        // console.log(passwordHash);
        
        const data = {...req.body, password: passwordHash};
        if(data?.skills){
            data.skills = [...new Set(data.skills)];
            if(data.skills.length > 10){
                throw new Error("Skills cannot be more than 10");
            }
        }

        // Creating a new instance of the User model

        const user = new User(data);
        await user.save();
        res.json({ message: "User Added successfully" });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
    
});

authRouter.post('/login', async (req, res) => {

    try {
        const { emailId, password } = req.body;
        if(!emailId){
            throw new Error("Please enter the email Id!");
        }
        if(!password) {
            throw new Error("Please enter the password!");
        }
        else if(!validator.isEmail(emailId)) {
            throw new Error("Invalid Credentials!");
        }
        const user = await User.findOne({emailId: emailId});
        if(!user) {
            throw new Error("Invalid Credentials!");
        }
        const isPasswordValid = await user.validatePassword(password); 
        if(isPasswordValid){

            // Create a JWT Token
            const token = await user.getJWT();

            // Add the token to cookie and send the response back to the user
            res.cookie("token", token, { httpOnly: true, secure: true, expires: new Date(Date.now() + 7 * 86400000)});
            res.json({ message: "Login Successful!!!" });
        } else {
            throw new Error("Invalid Credentials!");
        }
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
    
});

authRouter.post('/logout', (req, res)=> {

    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        })
        .json({ message: 'User logged out successfully!' });
    
    } catch(err) {
        res.status(400).json( { message: err.message });
    }
    

});

module.exports = authRouter;