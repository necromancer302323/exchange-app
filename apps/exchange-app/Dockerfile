FROM node:latest

WORKDIR /src

COPY package.json ./
RUN  npm i
COPY . .

RUN npm i

EXPOSE 5173

CMD ["npm", "run", "dev","-- --host"]
