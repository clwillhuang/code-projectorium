const express = require("express");
const { requireAuthentication } = require("../controllers/requireAuthentication");
const { requirePageOwnership } = require("../controllers/requireProjectOwnership");

// Use express router to define routes starting with /pages
const pagesRoutes = express.Router();

// Import models
const { SnippetModel } = require("../models/Snippet");

/**
 * @openapi
 * /pages/{pageId}:
 *      get: 
 *          summary: Get page information
 *          description: Query for a page in a project owned by the currently authenticated user. 
 *          tags:
 *              - pages
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
 *                  description: An object representing a page in a project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/PageWithSnippets"
 * 
 *              400:
 *                  description: Bad request. The pageId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A page matching the pageId was not found.
 *              500:
 *                  description: Internal error.
 */
pagesRoutes.route("/pages/:id").get(
    requireAuthentication,
    requirePageOwnership,
    async (req, res) => {
        SnippetModel.find({ page: req.params.id })
            .then(snippets => { res.send({ ...req.page._doc, snippets: snippets }); })
            .catch(err => { res.sendStatus(500) });
    })

/**
 * @openapi
 * /pages/{pageId}:
 *      patch: 
 *          summary: Update page information
 *          description: Modify a page in a project owned by the currently authenticated user. 
 *          tags:
 *              - pages
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/PagePatch"
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
 *                  description: Successful update of the page.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  modifiedCount:
 *                                      description: The number of pages modified.
 *                                      type: integer
 *                                      example: 1
 *                                  acknowledged:
 *                                      description: Was the update operation ran to the database using write concern? 
 *                                      type: boolean
 *                                      example: true
 * 
 *              400:
 *                  description: Bad request. The pageId parameter was not a valid identifier or the update operation could not update the page in the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A page matching the pageId was not found.
 *              500:
 *                  description: Internal error.
 */
pagesRoutes.route("/pages/:id").patch(
    requireAuthentication,
    requirePageOwnership,
    async (req, res) => {
        let newData = {}
        try {
            newData = {
                $set: {
                    title: req.body.title
                },
            };
        } catch(error) {
            res.sendStatus(400);
            return;
        }

        req.page.updateOne(newData)
            .then(response => {

                if (response.matchedCount === 0) {
                    res.sendStatus(400);
                    return;
                }

                console.log(`1 page updated: ${req.params.id}`);
                const { modifiedCount, acknowledged } = response
                res.send({ modifiedCount, acknowledged });
            })
            .catch(err => { res.status(500); });
    });

/**
 * @openapi
 * /pages/{pageId}:
 *      delete: 
 *          summary: Delete a page
 *          description: Delete a page in a project owned by the currently authenticated user. 
 *          tags:
 *              - pages
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
 *                  description: Successful deletion of the page.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Page"
 * 
 *              400:
 *                  description: The pageId parameter was not a valid identifier, or the operation failed to delete the page from the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A page matching the pageId and belonging to a project owned by the authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */
pagesRoutes.route("/pages/:id").delete(
    requireAuthentication,
    requirePageOwnership,
    async (req, res) => {
        req.page.deleteOne()
            .then(response => {

                if (!response) {
                    res.sendStatus(400);
                    return;
                }

                console.log(`1 page deleted: ${req.params.id}`);
                res.send(response)
            })
            .catch(err => { res.status(500).send(`Unable to delete page with id ${req.params.id}`) });
    })

/**
 * @openapi
 * /pages/{pageId}/snippets:
 *      post: 
 *          summary: Create a snippet
 *          description: Create a new snippet in the page.
 *          tags:
 *              - pages
 *              - snippets
 *          parameters:
 *            - in: path
 *              name: pageId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of the page
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/SnippetPost"
 *                          
 *          produces:
 *              - application/json
 *          responses:
 *              201: 
 *                  description: Snippet successfully created and an object representing the snippet is returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Snippet"
 * 
 *              400:
 *                  description: Bad request. The body parameters were invalid or the given pageId was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A page matching the pageId was not found.
 *              500:
 *                  description: Internal error. Unable to create snippet.
 */
pagesRoutes.route("/pages/:id/snippets").post(
    requireAuthentication,
    requirePageOwnership,
    async (req, res) => {
        let newData = {}
        try {
            const initialProps = ['markdown', 'code', 'language', 'showCode', 'showMarkdown']

            initialProps.forEach(property => {
                if (req.body.hasOwnProperty(property)) {
                    newData[property] = req.body[property]
                }
            })
        } catch(error) {
            res.sendStatus(400);
            return;
        }
        try {
            newData = {
                ...newData,
                project: req.page._doc.project,
                page: req.page._doc._id,
            }
        } catch(error) {
            res.sendStatus(500);
            return;
        }

        SnippetModel.create(newData)
            .then(response => {
                console.log(`1 snippet created for page ${req.params.id}`)
                res.send(response)
            })
            .catch(err => { res.status(500).send(`Unable to create snippet.`) });
    }
)

module.exports = pagesRoutes