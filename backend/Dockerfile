FROM node:19.0.1-alpine3.15

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli 

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

ENTRYPOINT npm run start:dev
