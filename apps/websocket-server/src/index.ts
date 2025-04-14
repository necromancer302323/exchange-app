import { createClient } from "redis";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";


const server = http.createServer(function (request: any, response: any) {
    console.log(new Date() + " Received request for " + request.url);
    response.end("hi there");
  });
const wss= new WebSocketServer({server})

const pubSub=createClient({
    url:"redis://pub-sub:6379"
})

  
pubSub.on('error', (err) => console.log('Redis Client Error', err));

wss.on("connection",async function(ws:WebSocket){
    await pubSub.subscribe("order", (message,count)=>{
      console.log(message)
      ws.send(message)
    }
      )

})

async function startServer() {
    try {
        await pubSub.connect();
        console.log("Connected to Redis");

        server.listen(8080,"0.0.0.0", () => {
            console.log("Server is running on port 8080");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();