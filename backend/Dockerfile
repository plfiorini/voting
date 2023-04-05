FROM node:19-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

CMD ["node", "build/main.js"]
