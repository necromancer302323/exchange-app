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
        const a=await client.rPop("order")
        console.log(a)
        setInterval(async () => {
            await pubSub.publish("order","2")
        }, 1000);
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();