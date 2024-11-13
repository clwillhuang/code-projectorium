FROM node:slim

WORKDIR /code-projectorium

COPY . .

RUN npm install 

CMD [ "node", "server.js" ]

EXPOSE ${PORT}