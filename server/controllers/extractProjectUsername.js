const { UserModel } = require("../models/User");

// Given a project object, add the username to the object
const extractProjectUsername = async (project) => {
    return UserModel.findById(project.user)
        .then(user => {
            return {
                ...project._doc, username: user.username
            }
        })
}

// Given a list of projects, add the usernames to each project 
const extractProjectUsernameMany = async(projects) => {
    return Promise.all(projects.map(project => extractProjectUsername(project)));
}

module.exports = {
    extractProjectUsername,
    extractProjectUsernameMany
}