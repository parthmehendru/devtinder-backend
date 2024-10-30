const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    emailId: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        // minLength: [8, 'Password must be at least 8 characters long'],
        // match: [
        //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        //     'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        //   ],
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Your password is weak.Enter a strong one");
            }
        }
    },
    age: {
        type: Number,
        required: true,
        min: [18, 'You must be at least 18 years old']
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is not a valid gender type!`
        },
        validate: (value)=> {
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data is not valid!");
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_640.png",
        validate(value){
            if(!validator.isURL(value)) {
                throw new Error("Invalid Photo URL!" + value);
            }
        }
    },
    about: {
        type: String,
        default: "This is a default description of the user.",
        maxLength: 100
    },
    skills: {
        type: [String],
        maxLength: 10
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date

}, {
    timestamps: true
});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id}, "A_B_D_E_V_I_L_L_I_E_R_S", { expiresIn: '7d' });

    return token;
}

userSchema.methods.validatePassword = async function (password) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(password, user.password); 

    return isPasswordValid;
}

const User = mongoose.model("User", userSchema);
module.exports = User;