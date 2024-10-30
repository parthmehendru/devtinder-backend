const validator = require('validator');

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password, age } = req.body;

    if(!firstName) {
        throw new Error("Please enter the first name!");
    }
    if(!lastName) {
        throw new Error("Please enter the last name!");
    }
    if(!emailId) {
        throw new Error("Please enter the email Id!");
    }
    if(!password) {
        throw new Error("Please enter the password!");
    }
    if(!age) {
        throw new Error("Please enter the age!");
    }
    else if(!validator.isEmail(emailId)) {
        throw new Error("Email is not valid!");
    }
    else if(!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }


};

module.exports = validateSignUpData;