FROM node:lts-alpine
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production && npm install -g typescript && mv node_modules ../
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
