FROM node:12-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN apk add --no-cache python2 make g++
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm test
EXPOSE 3000
CMD ["npm", "start"]
