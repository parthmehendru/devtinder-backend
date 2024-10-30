const express = require("express");
const connectionRequestModel = require("../models/connectionRequest");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

// Get all the pending connection requests for the loggedIn User
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await connectionRequestModel
      .find({ toUserId: loggedInUser._id, status: "interested" })
      .populate("fromUserId", "firstName lastName photoUrl age gender about skills");
    //   .populate("fromUserId", ["firstName", "lastName"]);
    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res)=> {
    try {
        const loggedInUser = req.user;
        const connections = await connectionRequestModel.find({$or: [{fromUserId: loggedInUser._id, status: "accepted"}, {toUserId: loggedInUser._id, status: "accepted"}]}).populate("fromUserId", "firstName lastName age gender skills photoUrl about").populate("toUserId", "firstName lastName age gender skills photoUrl about");
        const data = connections.map((element)=> {
            if(element.fromUserId?._id?.toString()===loggedInUser?._id?.toString()){
                return element.toUserId;
            }
            else{
                return element.fromUserId;
            }
        })
        res.json({data});
    } catch(err){
        res.status(400).json({message: err.message});
    }
});

userRouter.delete('/user/remove-connection/:userIdToRemove', userAuth, async (req, res)=> {
    const { userIdToRemove } = req.params;
    const loggedInUserId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userIdToRemove)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    try {
        const connection = await connectionRequestModel.findOneAndDelete({$or: [{fromUserId: loggedInUserId, toUserId: userIdToRemove, status: "accepted"}, { fromUserId: userIdToRemove, toUserId: loggedInUserId, status: "accepted"}]});
        if (!connection) {
            return res.status(404).json({ message: 'Connection not found' });
        }
        res.status(200).json({ message: 'Connection removed successfully' });
    } catch (error) {
        res.status(500).json({ message: err.message});
      }
});

userRouter.get("/feed", userAuth, async (req, res)=> {
  try {
    const loggedInUser = req.user;
    
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit>50 ? 50 : limit;

    const connectionRequests = await connectionRequestModel.find({ $or: [{fromUserId: loggedInUser._id}, {toUserId: loggedInUser._id}]}).select("fromUserId toUserId");
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });
    
    const users = await User.find({
      $and: [
        {  _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne : loggedInUser._id} }
      ]
     
    }).select("firstName lastName age gender skills photoUrl about").skip((page-1)*limit).limit(limit);

    res.json({ data: users });

  } catch(err) {
    res.status(400).json({ message: err.message});
  }
})

module.exports = userRouter;
