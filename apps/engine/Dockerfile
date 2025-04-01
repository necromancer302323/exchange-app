FROM node:20

WORKDIR /src

COPY . .

RUN npm i
RUN npm install -g typescript
RUN npx tsc -b
EXPOSE 3001

CMD [ "node","dist/index.js" ]