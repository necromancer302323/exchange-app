FROM node:20

WORKDIR /app

COPY package.json ./    

COPY packages ./packages

COPY apps/api-server ./apps/api-server

RUN npm install

RUN npm run generate --workspace=@repo/db
RUN npm run build --workspaces --if-present

WORKDIR /app/apps/api-server
RUN npm i typescript
RUN npx tsc -b

WORKDIR /app/apps/api-server

EXPOSE 3000

CMD [ "node","dist/index.js" ]