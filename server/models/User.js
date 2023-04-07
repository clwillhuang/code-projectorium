const mongoose = require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 16;

let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: MIN_USERNAME_LENGTH,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: MIN_PASSWORD_LENGTH,
        maxLength: MAX_PASSWORD_LENGTH
    }
})

UserSchema.plugin(passportLocalMongoose)

module.exports = {
    UserModel: mongoose.model("User", UserSchema),
    MIN_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH
}