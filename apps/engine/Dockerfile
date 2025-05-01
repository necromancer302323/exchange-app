FROM node:20

WORKDIR /
COPY package.json ./
RUN npm i
COPY . .
RUN npm install typescript
RUN npx tsc -b
EXPOSE 3001

CMD [ "node","dist/index.js" ]