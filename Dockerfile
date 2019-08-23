FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install --production

COPY *.js ./

CMD ["npm", "run", "start"]