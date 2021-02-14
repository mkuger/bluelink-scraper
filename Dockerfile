FROM node:15-alpine
MAINTAINER michael@mikuger.de

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY env.js .
COPY index.js .

CMD [ "node", "index.js" ]