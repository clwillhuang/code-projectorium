const { default: mongoose } = require("mongoose");
const { PageModel } = require("../models/Page");
const { ProjectModel } = require("../models/Project");
const { SnippetModel } = require("../models/Snippet");

// proceeds to next middleware iff snippet specified by req.params.id is owned by user. Adds project as req.project
const requireProjectOwnership = async (req, res, next) => {
    let projectId = false;
    try {
        projectId = req.projectId;
    } catch {
        console.log(req);
        res.sendStatus(500);
    }

    try {
        if (typeof projectId === 'string') {
            projectId = mongoose.Types.ObjectId(projectId);
        } 
    } catch {
        res.sendStatus(400);
        return;
    }

    const project = await ProjectModel.findOne({ _id: projectId, user: req.user._id })
    if (project) {
        req.project = project;
        next();
    } else {
        res.status(404).send({message: `Project id ${projectId} not found.`});
    }
}

// proceeds to next middleware iff snippet specified by req.params.id is owned by user. Adds page as req.page
const requirePageOwnership = async (req, res, next) => {
    let pageId = '';
    try {
        pageId = req.params.id;
    } catch {
        console.log(req.params);
        res.sendStatus(500);
        return;
    }
    try {
        if (typeof pageId === 'string') {
            pageId = mongoose.Types.ObjectId(pageId);
        } 
    } catch {
        res.sendStatus(400);
        return;
    }

    const callback = () => {
        next();
    }
    const page = await PageModel.findOne({ _id: pageId });
    if (page) {
        req.page = page;
        req.projectId = page._doc.project;
        await requireProjectOwnership(req, res, callback);
    } else {
        res.status(404).send({message: `Page id ${pageId} not found.`});
    }
}

// proceeds to next middleware iff snippet specified by req.params.id is owned by user. Adds snippet as req.snippet 
const requireSnippetOwnership = async(req, res, next) => {
    let snippetId = '';
    try {
        snippetId = req.params.id;
    } catch {
        console.log(req.params);
        res.sendStatus(500);
        return;
    }

    try {
        if (typeof snippetId === 'string') {
            snippetId = mongoose.Types.ObjectId(snippetId);
        } 
    } catch {
        res.sendStatus(400);
        return;
    }

    const callback = () => {
        next();
    }

    const snippet = await SnippetModel.findOne({ _id: snippetId });
    if (snippet) {
        req.snippet = snippet;
        req.projectId = snippet._doc.project;
        await requireProjectOwnership(req, res, callback);
    } else {
        res.status(404).send({message: `Snippet id ${snippetId} not found.`});
    }
}

module.exports = {
    requireProjectOwnership,
    requirePageOwnership,
    requireSnippetOwnership
}