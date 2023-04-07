const express = require("express");
const passport = require("passport");

// Use express router to define routes starting with /snippets
const userRoutes = express.Router();

// Use snippet model
const { UserModel, MIN_USERNAME_LENGTH, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = require("../models/User");

/**
 * @openapi
 * /user:
 *      get:
 *          summary: Get information of signed-in user
 *          description: Get information on the current authenticated user, if any.
 *          tags:
 *              - authentication
 *          produces:
 *              - application/json
 *          responses:
 *              200:
 *                  description: Returns information on the user, if authenticated.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  isAuthenticated:
 *                                      description: Is the request successfully authenticated?
 *                                      type: boolean
 *                                      example: true
 *                                  username:
 *                                      description: The username of the user. An empty string if not authenticated.
 *                                      type: string
 *                                      example: John Doe
 *                                  _id:
 *                                      description: The identifier (_id) of the user. An empty string if not authenticated.                             
 *                                      type: string
 *                                      example: 63b074809d1dd1fa0b7cea76
 *                  
 */
userRoutes.route('/user').get(async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.send({ isAuthenticated: false, username: "", _id: "" })
    } else {
        const { username, _id } = req.user;
        return res.send({ isAuthenticated: true, ...{ username, _id } })
    }
})

/**
 * @openapi
 * /users/register:
 *      post:
 *          summary: Register a new user
 *          tags:
 *              - authentication
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/UserRegisterPost"
 *              
 *          produces:
 *              - application/json
 *          responses:
 *              200:
 *                  description: User successfully registered and logged in. Sends a cookie for tied to the current session.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/RegistrationResult"
 *              400:
 *                  description: Bad request. The request is missing the body parameters or does not fulfill the username, email, and/or password requirements.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/RegistrationResult"
 *                  
 */
userRoutes.route('/users/register').post(async (req, res, next) => {
    let username, email, password;

    let validity = {
        usernameValid: true,
        emailValid: true,
        passwordValid: true
    }

    try {
        username = req.body.username;
        if (typeof username !== 'string' || username.length < MIN_USERNAME_LENGTH) {
            validity.usernameValid = false;
        } else {
            // check if email or username already used
            UserModel.exists({ username: username })
                .then(response => {
                    if (response) {
                        validity.usernameValid = false;
                    }
                })
        }
    } catch {
        validity.usernameValid = false;
    }
    try {
        email = req.body.email;

        // Validate email with regular expressions (not recommended).
        // In practice, we should be validating the email by using a service or sending the email address a message.
        const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (!emailRegExp.test(email)) {
            validity.emailValid = false;
        } else {
            UserModel.exists({ email: email })
                .then(response => {
                    if (response) {
                        validity.emailValid = false;
                    }
                })
        }
    } catch {
        validity.emailValid = false;
    }
    try {
        password = req.body.password;
        // Requirements:
        // Must be alphanumeric
        // at least MIN_PASSWORD_LENGTH characters long, at most MAX_PASSWORD_LENGTH
        // at least one digit
        // at least one uppercase letter and one lowercase letter
        const passwordReq = new RegExp(`^(?=^.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{${MIN_PASSWORD_LENGTH},${MAX_PASSWORD_LENGTH}}$`)
        console.log(passwordReq)
        if (!passwordReq.test(password)) {
            validity.passwordValid = false;
        }
    } catch {
        validity.passwordValid = false;
    }

    console.log(validity, req.body)

    if (!validity.usernameValid || !validity.emailValid || !validity.passwordValid) {
        res.status(400).send(validity);
        return;
    }

    UserModel.register(new UserModel({ username, email, password }), password, (err, account) => {
        if (err) {
            res.status(400);
            return;
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.send({
                    usernameValid: true,
                    emailValid: true,
                    passwordValid: true
                });
            });
        });
    });
})

/**
 * @openapi
 * /users/login:
 *      post:
 *          summary: Login
 *          description: Login with session cookie authentication.         
 *          tags:
 *              - authentication 
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: "#/components/UserLoginPost"
 *          produces:
 *              - application/json
 *          responses:
 *              200:
 *                  description: User successfully logged in. Sends back a cookie tied to the current session.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      example: 'Login success'
 *              401:
 *                  description: Unsuccessful login. Invalid username and password combination.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: "#/components/RegistrationResult"
 *                  
 */
userRoutes.route('/users/login').post((req, res) => {
    passport.authenticate('local')(req, res, () => {
        req.session.save((err) => {
            if (err) {
                res.sendStatus(403);
            }
            res.send({ message: `Login success` });
        })
    })
})

/**
 * @openapi
 * /users/logout:
 *      post:
 *          summary: Logout
 *          description: Logout of the current user session.
 *          tags:
 *              - authentication
 *          produces:
 *              - application/json
 *          responses:
 *              200:
 *                  description: User successfully logged out.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              properties:
 *                                  message:
 *                                      type: string
 *                                      example: 'Logout success'
 *              401:
 *                  description: Unsuccessful logout. 
 *                  
 */
userRoutes.route('/users/logout').post(async (req, res, next) => {
    req.session.user = null;
    req.session.save(function (err) {
        if (err) next(err);
        req.session.regenerate(function (err) {
            if (err) next(err);
            res.send({ message: `Logout success` })
        })
    })
});

module.exports = userRoutes;