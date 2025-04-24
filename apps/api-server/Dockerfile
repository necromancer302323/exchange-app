FROM node:latest

WORKDIR /src
COPY . .
RUN  npm i
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npm run build \
    --workspace=@repo/db \
    --workspace=@repo/common \
    --workspace=api-server \
    --if-present
WORKDIR /src/apps/api-server
EXPOSE 3000

CMD [ "node","dist/index.js" ]