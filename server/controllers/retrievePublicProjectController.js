const { ProjectModel } = require("../models/Project");
const { default: mongoose } = require("mongoose");

const retrievePublicProjectController = async (req, res, next) => {
    let projectId = req.params.projectId;
    try {
        if (typeof projectId === 'string') {
            projectId = mongoose.Types.ObjectId(projectId);
        }
    } catch {
        res.sendStatus(400);
        return;
    }

    await ProjectModel.findById({ _id: projectId, published: true })
        .then(project => {
            if (!project) {
                res.sendStatus(404);
                return;
            } else {
                req.project = project;
                next();
            }
        })
        .catch(response => res.sendStatus(500));
};
exports.retrievePublicProjectController = retrievePublicProjectController;
