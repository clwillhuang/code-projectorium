const express = require("express");

// Use express router to define routes starting with /projects
const commentRoutes = express.Router();

// Use the Project model
const { ProjectModel } = require("../models/Project");
const { SnippetModel } = require("../models/Snippet");
const { CommentModel } = require("../models/Comment");

const { requireAuthentication } = require("../controllers/requireAuthentication");
const { requireProjectOwnership, requireSnippetOwnership } = require("../controllers/requireProjectOwnership");
const { retrieveSnippetComments } = require("../controllers/snippetCommentControllers");
const { extractCommentPosterUsername } = require("../controllers/extractCommentPosterUsername");

/**
 * @openapi
 * /snippets/{snippetId}/comments:
 *      get: 
 *          summary: Query for a list of all comments on one snippet. 
 *          description: Query for a list of all comments on the snippet with the identifier specified. 
 *          tags:
 *              - snippets
 *              - comments
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
 *                  description: An object representing a snippet in a project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/SnippetWithComments"
 * 
 *              400:
 *                  description: Bad request. The snippetId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A snippet matching the snippetId and belonging to a project owned by the currently authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */commentRoutes.route("/snippets/:id/comments").get(
    requireAuthentication,
    requireSnippetOwnership,
    async (req, res) => {
        retrieveSnippetComments(req.snippet)
            .then(response => res.send(response))
            .catch(err => { res.sendStatus(500) });
    });

/**
 * @openapi
 * /comments/{commentId}:
 *      delete: 
 *          summary: Delete a comment
 *          description: Delete a comment in a project owned by the currently authenticated user. 
 *          tags:
 *              - comments
 *          parameters:
 *            - in: path
 *              name: commentId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of the comment
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: Successful deletion of the comment.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Comment"
 * 
 *              400:
 *                  description: The commentId parameter was not a valid identifier, or the operation failed to delete the comment from the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A comment matching the commentId and belonging to a project owned by the authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */
commentRoutes.route("/comments/:commentId").delete(
    requireAuthentication,
    async (req, res, next) => {
        const comment = await CommentModel.findById({ _id: req.params.commentId });
        if (comment) {
            req.comment = comment;
            req.projectId = comment.project;
            next();
        } else {
            res.sendStatus(404);
        }
    },
    // allow only the project owner to delete comments
    requireProjectOwnership,
    async (req, res) => {
        req.comment.deleteOne()
            .then(response => {
                if (!response) {
                    res.sendStatus(400);
                    return;
                }

                console.log(`1 comment deleted: ${req.params.commentId}`)
                res.send(response);
            })
            .catch(err => { res.sendStatus(500) });
    }
)

/**
 * @openapi
 * /snippets/{snippetId}/comments:
 *      post: 
 *          summary: Post a comment
 *          description: Post a new comment under a snippet in an accessible project. A project is accessible if it is published, or the comment to be posted is from the same user as the project owner.
 *          tags:
 *              - snippets
 *              - comments
 *          parameters:
 *            - in: path
 *              name: snippetId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of the snippet
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/CommentPost"     
 *          produces:
 *              - application/json
 *          responses:
 *              201: 
 *                  description: Comment successfully created and an object representing the comment is returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Comment"
 * 
 *              400:
 *                  description: Bad request. The body parameters were invalid or the given pageId was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A snippet matching the snippetId and belonging to an accessible project was not found.
 *              500:
 *                  description: Internal error. Unable to create comment.
 */
commentRoutes.route("/snippets/:id/comments").post(
    requireAuthentication,
    async (req, res) => {
        const snippet = await SnippetModel.findById(req.params.id);

        if (!snippet) {
            res.sendStatus(404);
            return;
        }

        // only allow posting if the project is public or the user posting is the owner 
        const project = await ProjectModel.findById(snippet._doc.project);
        if (!project) {
            res.sendStatus(404);
            return;
        }

        if (!project._doc.published && project.user._id.toString() !== req.user._id) {
            res.sendStatus(403);
            return;
        }

        const now = new Date();

        await CommentModel.create({
            poster: req.user._id,
            project: snippet._doc.project,
            page: snippet._doc.page,
            snippet: snippet._doc._id,
            markdown: req.body.markdown,
            posted: now.toISOString(),
        })
            .then(extractCommentPosterUsername)
            .then(response => res.send(response))
            .catch(err => res.send(err));
    })

module.exports = commentRoutes;