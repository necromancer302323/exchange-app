FROM node:20

WORKDIR /
COPY package.json ./
RUN npm i
RUN npm install typescript
COPY . .
RUN npx tsc -b
EXPOSE 3001

CMD [ "node","dist/index.js" ]