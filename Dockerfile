FROM node:21-alpine3.18
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY src src
CMD ["npm", "run", "start"]