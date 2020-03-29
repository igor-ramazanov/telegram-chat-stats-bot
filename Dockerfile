FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install --production

COPY *.js ./

COPY src ./src

CMD ["npm", "run", "start"]