const express = require("express");
const { requireAuthentication } = require("../controllers/requireAuthentication");
const { requireSnippetOwnership } = require("../controllers/requireProjectOwnership");

// Use express router to define routes starting with /snippets
const snippetsRoutes = express.Router();

// Use snippet model
const { SnippetModel } = require("../models/Snippet");

/**
 * @openapi
 * /snippets/{snippetId}:
 *      get: 
 *          summary: Get snippet information
 *          description: Query for a snippet in a project owned by the currently authenticated user. 
 *          tags:
 *              - snippets
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
 *                              $ref: "#/components/Snippet"
 * 
 *              400:
 *                  description: Bad request. The snippetId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A snippet matching the snippetId and belonging to a project owned by the currently authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */
snippetsRoutes.route("/snippets/:id").get(
    requireAuthentication,
    requireSnippetOwnership,
    async (req, res) => { res.send(req.snippet) }
);

/**
 * @openapi
 * /snippets/{snippetId}:
 *      patch: 
 *          summary: Update snippet information
 *          description: Update a snippet in a project owned by the currently authenticated user. 
 *          tags:
 *              - snippets
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/SnippetPatch"
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
 *                  description: Successful update of the snippet.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  modifiedCount:
 *                                      description: The number of snippets modified.
 *                                      type: integer
 *                                      example: 1
 *                                  acknowledged:
 *                                      description: Was the update operation ran to the database using write concern? 
 *                                      type: boolean
 *                                      example: true
 * 
 *              400:
 *                  description: Bad request. The snippetId parameter was not a valid identifier or the update operation could not update the snippet in the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A snippet matching the snippetId and belonging to a project owned by the authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */
snippetsRoutes.route("/snippets/:id").patch(
    requireAuthentication,
    requireSnippetOwnership,
    async (req, res) => {
        const omitted = ['_id', '__v', 'project', 'page']
        const properties = Object.keys(SnippetModel.schema.paths).filter(props => !omitted.includes(props))

        let newObj = {}
        properties.forEach(property => {
            if (req.body.hasOwnProperty(property)) {
                newObj[property] = req.body[property]
            }
        })

        let newData = { $set: newObj };

        req.snippet.updateOne(newData)
            .then(response => {

                if (response.matchedCount === 0) {
                    res.sendStatus(400);
                    return;
                }

                console.log("1 Snippet updated");
                const { modifiedCount, acknowledged } = response
                res.send({ modifiedCount, acknowledged });
            })
            .catch(err => { res.status(500); });
    });

/**
 * @openapi
 * /snippets/{snippetId}:
 *      delete: 
 *          summary: Delete a snippet
 *          description: Delete a snippet in a project owned by the currently authenticated user. 
 *          tags:
 *              - snippets
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
 *                  description: Successful deletion of the snippet.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Snippet"
 * 
 *              400:
 *                  description: The snippetId parameter was not a valid identifier, or the operation failed to delete the snippet from the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A snippet matching the snippetId and belonging to a project owned by the authenticated user was not found.
 *              500:
 *                  description: Internal error.
 */
snippetsRoutes.route("/snippets/:id").delete(
    requireAuthentication,
    requireSnippetOwnership,
    async (req, res) => {
        req.snippet.deleteOne()
            .then(response => {
                if (!response) {
                    res.sendStatus(400);
                    return;
                }

                console.log(`1 snippet deleted: ${req.params.id}`);
                res.send(response)
            })
            .catch(err => { res.status(500).send(`Unable to delete snippet with id ${req.params.id}`) });
    }
);

module.exports = snippetsRoutes;