const express = require("express");
const path = require("path")
const app = express();

const cors = require("cors");
const passport = require("passport")
var cookieParser = require('cookie-parser');
const passportLocalStrategy = require("passport-local")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const { connectMongoose } = require("./db/connection");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;

app.use(cors({
	origin: "http://localhost:5173",
	credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	store: MongoStore.create({
		mongoUrl: process.env.ATLAS_URI,
		ttl: 60 * 60 * 24, // max lifetime of session, in seconds
		crypto: {
			secret: process.env.CRYPTO_SECRET
		}
	})
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes/project"));
app.use(require("./routes/snippet"));
app.use(require("./routes/page"));
app.use(require('./routes/view'));
app.use(require("./routes/users"));
app.use(require("./routes/comment"));

const { UserModel } = require("./models/User");
passport.use(new passportLocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    "definition": {
        "openapi": "3.0.0",
        "info": {
            "title": "Code Projectorium API",
            "version": "0.0.1",
            "description": "An Express API used to create and share software projects."
        },
        "servers": [
            {
                "url": "http://code-projectorium.vercel.app/api/v1/"
            }
        ]
    },
    "apis": ["./routes/*.js", "./models/*.yaml"],
}

const swaggerDocument = require('./swagger.json');
const swaggerSpec = swaggerJsDoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
	// perform a database connection when server starts
	connectMongoose(function (err) {
		if (err) console.error(err);

	});
	console.log(`Server is running on port: ${port}. Files served from ${path.join(__dirname, 'dist')}`);
});

module.exports = app