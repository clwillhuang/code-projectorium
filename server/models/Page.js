const mongoose = require("mongoose");
const { SnippetModel } = require("./Snippet");

const PageSchema = new mongoose.Schema({
    project: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }
})

PageSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log("Calling pre-hook for Page's 'deleteOne'");
    if (this) {
        console.log("Deleting snippets of page", this._id)
        await SnippetModel.deleteMany({ page: this._id })
    }
})

PageSchema.pre('deleteMany', async function () {
    console.log("Calling pre-hook for Page's 'deleteMany'");
    const pages = await this.model.find(this.getQuery())
    const pageIds = pages.map(page => page._doc._id)
    if (pageIds.length > 0) {
        console.log("Deleting snippets of pages", pageIds)
        await SnippetModel.deleteMany({ page: { $in: pageIds } })
    }
})

module.exports = {
    PageModel: mongoose.model('Page', PageSchema)
}
