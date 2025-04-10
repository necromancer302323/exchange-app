import { createClient } from "redis";



const client = createClient({
    url: "redis://my-redis:6379",
  });
  
const pubSub=createClient({
    url:"redis://pub-sub:6379"
})
const engine_pubsub = createClient({
    url: "redis://api-engine-pubsub:6379",
});

  


async function startServer() {
    try {
        await client.connect();
        await pubSub.connect()
        await engine_pubsub.connect()
        console.log("Connected to Redis");
        while (true){
        const response=await client.brPop("order" ,0)
        if(!response){
            
        }else{
         const message = JSON.parse(response.element)
            if(response){
                if(message.clientId){
               await engine_pubsub.publish(message.clientId,JSON.stringify({message:"a"}))
                }else{
              await pubSub.publish("order",JSON.stringify(response))
                }
            }
        }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}
function processingMessage({message,clientId}:{message:any,clientId: string}){
    switch (message.type){
        case "GET_DEPTH":
            try{
                engine_pubsub.publish(clientId,"got depth")
            }catch(e){
                engine_pubsub.publish(clientId,"error")
            }
    }
}
startServer();