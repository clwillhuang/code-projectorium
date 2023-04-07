const mongoose = require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');

let CommentSchema = new mongoose.Schema({
    project: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
    },
    page: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
    },
    snippet: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
    },
    markdown: {
        type: String,
        required: true,
        minLength: 15
    },
    posted: {
        type: Date,
        required: true,
    },
    poster: {
        type: mongoose.Types.ObjectId,
        unique: false,
        required: true,
    }
})

CommentSchema.plugin(passportLocalMongoose)

module.exports = {
    CommentModel: mongoose.model("Comment", CommentSchema),
}