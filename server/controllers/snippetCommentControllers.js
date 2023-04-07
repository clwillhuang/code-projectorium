const { CommentModel } = require("../models/Comment")
const { extractCommentPosterUsernameMany } = require("./extractCommentPosterUsername")

// Given a snippet, retrieve all comments 
const retrieveSnippetComments = async (snippet) => {
    return CommentModel.find({snippet: snippet._id})
    .then(comments => extractCommentPosterUsernameMany(comments))
    .then(comments => {
        return {...snippet._doc, comments: comments}})
}

const retrieveSnippetCommentsMany = async(snippets) => {
    return Promise.all(snippets.map(snippet => retrieveSnippetComments(snippet)))
}

module.exports = {
    retrieveSnippetComments,
    retrieveSnippetCommentsMany
}