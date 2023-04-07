const express = require("express");

// Use express router to define routes starting with /view
const viewRoutes = express.Router();

// Use the Project model
const { ProjectModel } = require("../models/Project");
const { PageModel } = require("../models/Page");
const { SnippetModel } = require("../models/Snippet");
const { CommentModel } = require("../models/Comment");
const { extractCommentPosterUsernameMany } = require("../controllers/extractCommentPosterUsername");
const { extractProjectUsernameMany, extractProjectUsername } = require("../controllers/extractProjectUsername");
const { retrievePublicPageController } = require("../controllers/retrievePublicPageController");
const { retrievePublicProjectController } = require("../controllers/retrievePublicProjectController");
const { retrievePublicSnippetController } = require("../controllers/retrievePublicSnippetController");

/**
 * @openapi
 * /view/projects:
 *      get: 
 *          summary: Get all published projects
 *          description: Query for all published projects in the website
 *          tags:
 *              - published projects
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object containing a list of objects, each corresponding to a published project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  projects:
 *                                      type: array
 *                                      items:
 *                                          $ref: "#/components/ProjectWithUser"
 * 
 *              500:
 *                  description: General server error
 */
viewRoutes.route("/view/projects").get(async (req, res) => {
    let query = { published: true }
    if (req.query.hasOwnProperty('user') && req.query.user) {
        query = { ...query, user: req.query.user.toString() }
    }

    ProjectModel.find(query)
        .then(response => extractProjectUsernameMany(response))
        .then(response => res.send({ projects: response }))
        .catch(err => { res.sendStatus(500); });
});

/**
 * @openapi
 * /view/projects/{projectId}:
 *      get: 
 *          summary: Get information of a published project
 *          description: Query for a published project using the given identifier and receive its information including a list of all its pages.
 *          tags:
 *              - published projects
 *          parameters:
 *            - in: path
 *              name: projectId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of published project
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object representing the published project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/ProjectWithUserAndPages"
 * 
 *              400:
 *                  description: Bad request. The projectId parameter was not a valid identifier.
 *              404:
 *                  description: A published project with that id was not found.
 *              500:
 *                  description: Internal error.
 */
viewRoutes.route("/view/projects/:projectId").get(
    retrievePublicProjectController,
    async (req, res) => {
        extractProjectUsername(req.project)
            .then(project => {
                PageModel.find({ project: req.project._id })
                    .then(response => res.send({ ...project, pages: response }))
            })
            .catch(response => { res.sendStatus(500) });
    });

// 

/**
 * @openapi
 * /view/pages/{pageId}:
 *      get: 
 *          summary: Get information of a page in a published project
 *          description: Query for a page in a published project, including all its snippets 
 *          tags:
 *              - published projects
 *          parameters:
 *            - in: path
 *              name: pageId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of the page
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object representing a page in a published project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/PageWithSnippets"
 * 
 *              400:
 *                  description: Bad request. The pageId parameter was not a valid identifier.
 *              404:
 *                  description: A page in a published project with that id was not found.
 *              500:
 *                  description: Internal error.
 */
viewRoutes.route("/view/pages/:pageId").get(
    retrievePublicPageController,
    async (req, res) => {
        SnippetModel.find({ page: req.page._id })
            .then(snippets => { res.send({ ...req.page._doc, snippets: snippets }); })
            .catch(err => { res.sendStatus(500) });
    })

/**
 * @openapi
 * /view/snippets/{snippetId}:
 *      get: 
 *          summary: Get information of a snippet in a published project
 *          description: Query for a snippet in a published project, and all of its comments
 *          tags:
 *              - published projects
 *          parameters:
 *            - in: path
 *              name: snippetId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of the snippet
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object representing a snippet in a published project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/SnippetWithComments"
 * 
 *              400:
 *                  description: Bad request. The snippetId parameter was not a valid identifier.
 *              404:
 *                  description: A snippet in a published project with that id was not found.
 *              500:
 *                  description: Internal error.
 */
viewRoutes.route("/view/snippets/:snippetId").get(
    retrievePublicSnippetController,
    async (req, res) => {
        CommentModel.find({ snippet: req.snippet._id })
            .then(comments => extractCommentPosterUsernameMany(comments))
            .then(response => {
                const returnValue = { ...req.snippet._doc, comments: response }
                res.send(returnValue)
                return response;
            })
            .catch(err => { res.sendStatus(500) });
    }
)

module.exports = viewRoutes;