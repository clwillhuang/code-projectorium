# Code Projectorium

Code Projectorium is a full-stack web application allowing users to share their coding projects online. Each project is composed of multiple pages, and each page is made of multiple snippets. This way, project authors can walkthrough their code page by page and snippet by snippet, with viewers being able to comment on each specific snippet to pose their questions or thoughts.

The website is split into the back-end REST API, located in the [client](./client/) folder, and the front-end website, located in the [server/](./server/) folder.

## The Software Stack

The tools used for developing the server and front-end website were selected around the classic "MERN" Stack.
- **MongoDB, Mongoose.js**; all site information is stored in the MongoDB database
- **Express**; allows us to create a back-end RESTful API
- **React**; a powerful tool for developing an interactive website front-end
- **Node**; used for its JavaScript runtime environment for servers
- **Passport**; used for user authentication
- **Bootstrap**; used to simplify CSS styling and UI components
- **Swagger**: used for generating documentation for the API in accordance with OpenAPI specifications

## Why?

This was a mainly a personal project to develop my skills in the MERN stack (MongoDB, Express, React, Node), a popular combination of software tools used to develop modern web applications. I tackled concepts such as implementing user authentication in Passport, working with database updates and deletions with hooks in MongoDB/Mongoose, and writing effective documentation for output to Swagger.

## Can I run this?

Unfortunately, this repository is not set up to be easily cloned and run on a separate machine. It also requires you to have your own MongoDB cluster set up. Time allowing, screenshots and detailed docs will follow in the future!



