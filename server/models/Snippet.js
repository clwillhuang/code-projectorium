const mongoose = require("mongoose");
const { CommentModel } = require("./Comment");

const SnippetSchema = new mongoose.Schema({
    project: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    page: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    markdown: {
        type: String,
        default: '',
    },
    code: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: 'plaintext',
        enum: ['plaintext', 'javascript', 'python']
    },
    showCode: {
        type: Boolean,
        default: true,
    },
    showMarkdown: {
        type: Boolean,
        default: true,
    }
})

SnippetSchema.pre('deleteOne', { document: true, query: false }, async function () {
    console.log("Calling pre-hook for Snippet's 'deleteOne'");
    if (this) {
        console.log("Deleting comments of snippet", this._id)
        await CommentModel.deleteMany({ snippet: this._id })
    }
})

SnippetSchema.pre('deleteMany', async function () {
    console.log("Calling pre-hook for Snippet's 'deleteMany'");
    const snippets = await this.model.find(this.getQuery())
    const snippetIds = snippets.map(snippet => snippet._doc._id)
    if (snippetIds.length > 0) {
        console.log("Deleting comments of snippets ", snippetIds)
        await CommentModel.deleteMany({ snippet: { $in: snippetIds } })
        return
    } else {
        return
    }
})

module.exports = {
    SnippetModel: mongoose.model("Snippet", SnippetSchema),
    SnippetSchema: SnippetSchema,
}