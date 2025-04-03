FROM node:20

WORKDIR /src

COPY . .

RUN npm i

EXPOSE 5173

CMD ["npm", "run", "dev","-- --host"]
