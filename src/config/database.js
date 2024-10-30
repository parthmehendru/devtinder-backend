const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:SM1Wqi4aa2V5dMW3@cluster0.oqt4omz.mongodb.net/devTinder");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

module.exports = connectDB;
