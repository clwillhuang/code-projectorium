const { UserModel } = require("../models/User")

// Given a comment object, add the username of the commenting User to the object as 'username'
const extractCommentPosterUsername = async (comment) => {
    return UserModel.findById(comment.poster)
        .then(user => { return {...comment._doc, username: user.username}})
}

const extractCommentPosterUsernameMany = async(comments) => {
    return Promise.all(comments.map(comment => extractCommentPosterUsername(comment)));
}

module.exports = {
    extractCommentPosterUsername,
    extractCommentPosterUsernameMany
}