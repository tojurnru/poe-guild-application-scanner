FROM node:16.8.0-slim

WORKDIR /app
COPY . /app
RUN yarn install --prod

CMD yarn start
