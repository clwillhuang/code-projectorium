const { ProjectModel } = require("../models/Project");
const { SnippetModel } = require("../models/Snippet");
const { default: mongoose } = require("mongoose");

const retrievePublicSnippetController = async (req, res, next) => {
    let snippetId = req.params.snippetId;
    try {
        if (typeof snippetId === 'string') {
            snippetId = mongoose.Types.ObjectId(snippetId);
        }
    } catch {
        res.sendStatus(400);
        return;
    }

    const snippet = await SnippetModel.findById(snippetId);
    if (!snippet) {
        res.sendStatus(404);
        return;
    }
    await ProjectModel.findById({ _id: snippet._doc.project, published: true })
        .then(project => {
            if (!project) {
                res.sendStatus(404);
                return;
            } else {
                req.snippet = snippet;
                next();
            }
        })
        .catch(response => res.sendStatus(500));
};
exports.retrievePublicSnippetController = retrievePublicSnippetController;
