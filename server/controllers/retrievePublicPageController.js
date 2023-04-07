const { ProjectModel } = require("../models/Project");
const { PageModel } = require("../models/Page");
const { default: mongoose } = require("mongoose");

const retrievePublicPageController = async (req, res, next) => {
    let pageId = req.params.pageId;
    try {
        pageId = mongoose.Types.ObjectId(pageId);
    } catch {
        res.sendStatus(400);
        return;
    }

    const page = await PageModel.findById(pageId);
    if (!page) {
        res.sendStatus(404);
        return;
    }

    ProjectModel.findOne({ _id: page._doc.project, published: true })
        .then(project => {
            if (!project) {
                res.sendStatus(404);
                return;
            } else {
                req.page = page;
                next();
            }
        })
        .catch(response => {res.sendStatus(500)});
};

exports.retrievePublicPageController = retrievePublicPageController;
