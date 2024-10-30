const express = require('express');
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const deleteAccountRouter = express.Router();
const connectionRequestModel = require("../models/connectionRequest");



deleteAccountRouter.delete('/profile/delete', userAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        await connectionRequestModel.deleteMany({
            $or: [{ fromUserId: userId }, { toUserId: userId }],
        });
        // Delete the user from the database
        await User.findByIdAndDelete(userId);

        // Clear the authentication cookie
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        res.json({ message: "Account deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting account: " + err.message });
    }
});

module.exports = deleteAccountRouter;
