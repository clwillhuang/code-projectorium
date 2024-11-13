# Code Projectorium

Code Projectorium is a full-stack web application that allows users to share their coding projects online. Each project is composed of multiple pages, and each page is made of multiple snippets. This way, project authors can go through their code page by page and snippet by snippet, with viewers being able to comment on each specific snippet to pose their questions or thoughts. This closely mirrors the layout of traditional online documentation API documentation made.

The website is split into the front-end web client, located in the [client](./client/) folder, and the back-end API, located in the [server/](./server/) folder.

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

This was mainly a personal project to develop my skills in the MERN stack (MongoDB, Express, React, Node), a popular combination of software tools used to develop modern web applications. I tackled concepts such as implementing user authentication in Passport, working with database updates and deletions with hooks in MongoDB/Mongoose, and writing effective documentation for output to Swagger.

## Can I run this?

Configure the server secrets and settings in `.env` following the example in `.example.env`. On MongoDB, create a new collection called `live-projectorium` in your cluster.

Finally, run the server using docker compose.
```
docker compose up --build server
```



