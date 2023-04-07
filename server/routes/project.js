const express = require("express");

// Use express router to define routes starting with /projects
const projectsRoutes = express.Router();

// Use the Project model
const { ProjectModel } = require("../models/Project");
const { PageModel } = require("../models/Page");
const { requireAuthentication } = require("../controllers/requireAuthentication");
const { requireProjectOwnership } = require("../controllers/requireProjectOwnership");
const { extractProjectUsername } = require("../controllers/extractProjectUsername");

/**
 * @openapi
 * /projects:
 *      get: 
 *          summary: Retrieve a signed-in user's projects
 *          description: Query for all the public and private projects owned by the authenticated user sending the request. Authentication completed using session cookies.
 *          tags:
 *              - projects
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object containing a list of projects and the username.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  projects:
 *                                      type: array
 *                                      items:
 *                                          $ref: "#/components/Project"
 *                                  username:
 *                                      type: string
 *                                      example: "John Doe"
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              500:
 *                  description: General server error.
 */
projectsRoutes.route("/projects").get(
    requireAuthentication,
    async (req, res) => {
        ProjectModel.find({ user: req.user._id })
            .then(response => {
                res.send({ projects: response, username: req.user.username })
            })
            .catch(err => { res.sendStatus(500); });
    });

/**
 * @openapi
 * /projects/{projectId}:
 *      get: 
 *          summary: Get project information
 *          description: Query for a project owned by the currently authenticated user using the projectId.
 *          tags:
 *              - projects
 *          parameters:
 *            - in: path
 *              name: projectId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of project
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: An object representing the project.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/ProjectWithUserAndPages"
 * 
 *              400:
 *                  description: Bad request. The projectId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A project belonging to the authenticated user with that projectId was not found.
 *              500:
 *                  description: Internal error.
 */
projectsRoutes.route("/projects/:projectId").get(
    requireAuthentication,
    async (req, res, next) => {
        req.projectId = req.params.projectId;
        next();
    },
    requireProjectOwnership,
    async (req, res) => {
        const project = await extractProjectUsername(req.project)
            .catch(err => { res.sendStatus(500); })

        // retrieve all pages in the project
        await PageModel.find({ project: project._id })
            .then(response => res.send({ ...project, pages: response }))
            .catch(err => { res.status(404); });
    }
);

/**
 * @openapi
 * /projects/{projectId}/pages:
 *      post: 
 *          summary: Create a page
 *          description: Create a new page under this project, which is owned by the currently authenticated user.
 *          tags:
 *              - projects
 *              - pages
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/PagePost"
 * 
 *          parameters:
 *            - in: path
 *              name: projectId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of project
 *                          
 *          produces:
 *              - application/json
 *          responses:
 *              201: 
 *                  description: Page successfully created and an object representing the page is returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Page"
 * 
 *              400:
 *                  description: Bad request. The projectId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A project belonging to the authenticated user with that projectId was not found.
 *              500:
 *                  description: Internal error. Unable to create page.
 */
projectsRoutes.route("/projects/:id/pages").post(
    requireAuthentication,
    async (req, res, next) => {
        req.projectId = req.params.id;
        next();
    },
    requireProjectOwnership,
    async (req, res) => {
        await PageModel.create({
            project: req.project._doc._id,
            title: req.body.title,
        })
            .then(response => res.send(response))
            .catch(err => { res.sendStatus(500); })
    })

/**
 * @openapi
 * /projects:
 *      post: 
 *          summary: Create a project
 *          description: Create a new project owned by the currently authenticated user.
 *          tags:
 *              - projects
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/ProjectPost"
 *                          
 *          produces:
 *              - application/json
 *          responses:
 *              201: 
 *                  description: Project successfully created and an object representing the project is returned.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/Project"
 * 
 *              400:
 *                  description: Bad request. The projectId parameter was not a valid identifier.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              500:
 *                  description: Internal error. Unable to create project.
 */
projectsRoutes.route("/projects").post(
    requireAuthentication,
    async (req, res) => {
        let newData = {}
        try {
            newData = {
                name: req.body.name,
                description: req.body.description,
                user: req.user._id,
                published: false,
                username: req.user.name
            }
        } catch(error) {
            res.sendStatus(400);
            return;
        }

        ProjectModel.create(newData)
            .then(response => res.send(response))
            .catch(err => { res.sendStatus(500); })
    });

/**
 * @openapi
 * /projects/{projectId}:
 *      patch: 
 *          summary: Update project information
 *          description: Update an existing project owned by the currently authenticated user.
 *          tags:
 *              - projects
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/ProjectPatch"
 *                          
 *          parameters:
 *            - in: path
 *              name: projectId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of project
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: Successfully updated project information.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  modifiedCount:
 *                                      description: The number of projects modified.
 *                                      type: integer
 *                                      example: 1
 *                                  acknowledged:
 *                                      description: Was the update operation ran to the database using write concern? 
 *                                      type: boolean
 *                                      example: true
 * 
 *              400:
 *                  description: The projectId parameter was not a valid identifier, or the update operation failed to update the project from the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A project belonging to the authenticated user with that projectId was not found.
 *              500:
 *                  description: Internal error.
 */
projectsRoutes.route("/projects/:projectId").patch(
    requireAuthentication,
    async (req, res, next) => {
        req.projectId = req.params.projectId;
        next();
    },
    requireProjectOwnership,
    async (req, res) => {
        let newData = {}
        try {
            newData = {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    published: req.body.published
                },
            };
        } catch (error) {
            res.sendStatus(400);
            return;
        }

        ProjectModel.findById(req.params.projectId)
            .updateOne(newData)
            .then(response => {
                if (response.matchedCount !== 1) {
                    res.sendStatus(400);
                    return;
                }
                console.log(`1 project updated: ${req.params.projectId}`);
                
                const { modifiedCount, acknowledged } = response
                res.send({ modifiedCount, acknowledged });
            })
            .catch(err => { res.sendStatus(500); })
    });

/**
 * @openapi
 * /projects/{projectId}:
 *      delete: 
 *          summary: Delete a project
 *          description: Delete an existing project owned by the currently authenticated user.
 *          tags:
 *              - projects
 *          parameters:
 *            - in: path
 *              name: projectId
 *              schema:
 *                  type: string
 *              required: true
 *              description: Identifier (_id) of project
 *          produces:
 *              - application/json
 *          responses:
 *              200: 
 *                  description: Successfully updated project information.
 *                  content:
 *                      application/json:
 *                          $ref: "#/components/Project"
 * 
 *              400:
 *                  description: Bad request. The projectId parameter was not a valid identifier, or the deletion operation failed to delete the project from the database.
 *              401:
 *                  description: Authentication information is missing or invalid.
 *              404:
 *                  description: A project belonging to the authenticated user with that projectId was not found.
 *              500:
 *                  description: Internal error.
 */projectsRoutes.route("/projects/:projectId").delete(
    requireAuthentication,
    async (req, res, next) => { // extract id to req.projectId
        req.projectId = req.params.projectId;
        next();
    },
    requireProjectOwnership,
    async (req, res) => {
        req.project.deleteOne()
            .then(projectResponse => {
                if (!projectResponse) {
                    res.sendStatus(400);
                    return;
                }

                console.log(`1 project deleted: ${req.params.projectId}`);
                res.send(projectResponse)
            })
            .catch(err => { res.sendStatus(500); })
    });

module.exports = projectsRoutes;