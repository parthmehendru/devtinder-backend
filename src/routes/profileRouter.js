const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const validator = require('validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const  User = require('../models/user');
const bcrypt = require('bcrypt');

profileRouter.get('/profile/view', userAuth, async (req, res)=> {

    try {
    
        const user = req.user;
        
        if(!user){
            throw new Error("User not found. Please login again!");
        }
        // console.log(cookies);
        res.json({ data: user });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
   
});

profileRouter.patch('/profile/edit', userAuth, async (req, res)=> {
    try {
        const allowedUpdates = ["photoUrl", "emailId", "skills", "about", "firstName", "lastName", "age"];
        const isUpdateAllowed = Object.keys(req.body).every((k)=> allowedUpdates.includes(k));
    
        if(!isUpdateAllowed){
            throw new Error("Invalid Edit Request!");
            // return res.status(400).send("");
        }
        if(req.body?.skills){
            req.body.skills = [...new Set(req.body.skills)];
            if(req.body.skills.length > 10){
                throw new Error("Skills cannot be more than 10");
            }
        }
        
        // const loggedInUserId = req.user._id;
        // const user = await User.findByIdAndUpdate(loggedInUserId, req.body, {returnDocument: "after", runValidators: true});


        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();
        res.json({message: `Hey ${loggedInUser.firstName}, your profile has been updated successfully!`, data: loggedInUser});
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
})

profileRouter.patch('/profile/password', userAuth, async (req, res)=> {
    try {

        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const reNewPassword = req.body.reNewPassword;
        const loggedInUser = req.user;

        if(!currentPassword) {
            throw new Error("Please enter the current password!");
        }
        if(!newPassword){
            throw new Error("Please enter the new password!");
        }
        if(!reNewPassword) {
            throw new Error("Please re-enter the new password!");
        }

        const isCurrentPasswordValid = await loggedInUser.validatePassword(currentPassword);
        if(!isCurrentPasswordValid){
            throw new Error("Current password you typed is invalid!");
        }
        if(newPassword!=reNewPassword){
            throw new Error("Passwords does not match!");
        }
        if(newPassword==currentPassword){
            throw new Error("New password can't be same as the previous passwords.");
        }
        if(!validator.isStrongPassword(newPassword)) {
            throw new Error("Your password is weak.Enter a strong one");
        }
        const passwordHash = await bcrypt.hash(newPassword, 9);
        loggedInUser.password = passwordHash;
        await loggedInUser.save();



        res.json({ message: 'Password changed successfully!' });


    } catch(err)  {
        res.status(400).json({message: err.message });
    }
});

profileRouter.post('/profile/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        if(!email){
            return res.status(400).send("Please enter the email id!");
        }
        if(!validator.isEmail(email)){
            return res.status(400).send("Invalid EmailId!");
        }
      const user = await User.findOne({ emailId: email });
      if (!user) return res.status(404).send("User not found");
  
      // Generate a token
      const token = crypto.randomBytes(20).toString('hex');
  
      // Set token and expiration
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();
  
      // Configure email transport
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        tls: {
            ciphers: 'SSLv3',
        },
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
  
      // Send the reset email
      const resetUrl = `http://localhost:7777/profile/reset-password/${token}`;
      const mailOptions = {
        to: user.emailId,
        from: process.env.EMAIL,
        subject: 'Password Reset',
        text: `Please click the following link to reset your password: ${resetUrl}`,
      };
  
      transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).send('Error sending email');
        res.json({ message: 'Password reset link sent successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  profileRouter.post('/profile/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
        if(!newPassword) {
            throw new Error("Please enter the current password!");
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check token expiration
        });
        
        if (!user) return res.status(400).send("Invalid or expired token");

        if(!validator.isStrongPassword(newPassword)) {
            throw new Error("Your password is weak.Enter a strong one");
        }
  

      
      const passwordHash = await bcrypt.hash(newPassword, 9);
      user.password = passwordHash;
      // Set new password
      user.resetPasswordToken = undefined; // Clear token
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = profileRouter;