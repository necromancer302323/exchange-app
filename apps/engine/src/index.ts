import { createClient } from "redis";



const client = createClient({
    url: "redis://my-redis:6379",
  });
  
const pubSub=createClient({
    url:"redis://pub-sub:6379"
})
  
client.on('error', (err) => console.log('Redis Client Error', err));


async function startServer() {
    try {
        await client.connect();
        await pubSub.connect()
        console.log("Connected to Redis");
        while (true){
        const response=await client.brPop("order",0)
        if(!response){

        }else{
            console.log(response)
            if(response){
                setTimeout(async ()=>{
                    await pubSub.publish("order",JSON.stringify(response))
                },1000)
                
            }
        }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();