const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {

    try { 
        const toUserId = req.params.toUserId;
        const fromUserId = req.user._id;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type: "+status});
        }

        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(404).json({ message: "User not found!"});
        }

        // Check if there is an existing Connection request
        const existingConnectionRequest = await connectionRequestModel.findOne({$or: [{fromUserId, toUserId}, {fromUserId: toUserId, toUserId: fromUserId}]});
        if(existingConnectionRequest){
           return res.status(400).json({ message: "Connection Request already exists!!"});
        }

        const connectionRequest = new connectionRequestModel({
            fromUserId, 
            toUserId,
            status,
        })

        const data = await connectionRequest.save(); 
        res.json({
            message:  req.user.firstName+" is "+ (status==="interested"?status:"not interested") +" in "+ toUser.firstName,
            data,
        });
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res)=> {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if(!allowedStatus.includes(status)) {
            return res.status(400).json({message: "Status not allowed!"});
        }

        const connectionRequest = await connectionRequestModel.findOne({_id: requestId, toUserId: loggedInUser._id, status: "interested"});
        if(!connectionRequest) {
            return res.status(404).json({message: "Connection request not found"});
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({ message: "Connection request "+status, data});
        // Abd => Starc
        // Is starc loggedInuserid = toUserId
        // status = interested
        // request Id should be valid



    } catch(err){
        res.status(400).json({message: err.message});
    }
})

module.exports = requestRouter;