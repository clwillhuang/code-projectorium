const mongoose = require("mongoose");
const { PageModel } = require("./Page");

const ProjectSchema = new mongoose.Schema({
    published: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxLength: 140,
    }
})

// Use a pre-hook to remove all pages under the project when project is deleted
ProjectSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log("Calling pre-hook for Project's 'deleteOne'");  
    if (this) {
        console.log("Deleting pages of project", this._id)
        await PageModel.deleteMany({project: this._id})
    }
})

ProjectSchema.pre('deleteMany', async function() {
    const projects = await this.model.find(this.getQuery())
    const projectIds = projects.map(project => project._doc._id)
    if (projects.length > 0) {
        console.log("Deleting pages of project", projectIds)
        await PageModel.deleteMany({project: {$in : projectIds}})
    }
})

module.exports = {
    ProjectModel: mongoose.model('Project', ProjectSchema)
}