FROM node:20

WORKDIR /src

COPY . .

RUN npm i
RUN npm i typescript
RUN npx tsc -b
EXPOSE 3000

CMD [ "node","dist/index.js" ]