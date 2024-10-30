const jwt = require('jsonwebtoken');
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    // Read the token from the req cookies

    try {
        const { token } = req.cookies;

        if(!token) {
            return res.status(401).json({ message: "Unauthorized access." });
        }

        const decodedObj = await jwt.verify(token, "A_B_D_E_V_I_L_L_I_E_R_S");
        
        const { _id } = decodedObj;

        const user = await User.findById(_id);
        if(!user) {
            throw new Error("User not cound");
        }

        req.user = user;
        next();
    } catch(err) {
        res.status(400).send(err.message);
    }

};

module.exports = { userAuth };