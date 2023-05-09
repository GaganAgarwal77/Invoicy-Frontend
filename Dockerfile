FROM node:12-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm build

FROM nginx:alpine
COPY build/ /usr/share/nginx/html
EXPOSE 80