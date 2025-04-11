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

  
interface Order {
    price: number;
    quantity: number;
    orderId: string;
}

interface Bid extends Order {
    side: 'bid';
}

interface Ask extends Order {
    side: 'ask';
}

interface Orderbook {
    bids: Bid[];
    asks: Ask[];
}

const orderbook: Orderbook = {
  bids: [
    
  ],
  asks: [
    
  ]
}

async function startServer() {
    try {
        await client.connect();
        await pubSub.connect()
        await engine_pubsub.connect()
        console.log("Connected to Redis");
        setInterval(()=>{
            console.log(orderbook)
        },5000)
        while (true){
        const response=await client.brPop("order" ,0)
        if(!response){
            
        }else{
         const message = JSON.parse(response.element)
          processingMessage(message.message,message.clientId)
                
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}
function processingMessage(message:any,clientId: string){
    console.log(message)
    switch (message.type){
        case "GET_DEPTH":
            try{
                engine_pubsub.publish(clientId,JSON.stringify(orderbook))
            }catch(e){
                engine_pubsub.publish(clientId,"error")
            }
        case "bid" :
            try{
                orderbook.bids.push({
                    price:message.price,
                    quantity:message.quantity,
                    orderId:Math.random().toString(),
                    side:"bid"
                })
                engine_pubsub.publish(clientId,JSON.stringify({message:"bid succesfull"}))
                pubSub.publish("order",JSON.stringify(orderbook))
            }catch(err){
                console.log(err)   
            }
        case "ask":
            try{
                orderbook.asks.push({
                    price:message.price,
                    quantity:message.quantity,
                    orderId:Math.random().toString(),
                    side:"ask"
                })
                engine_pubsub.publish(clientId,JSON.stringify({message:"ask succesfull"}))
                pubSub.publish("order",JSON.stringify(orderbook))
            }catch(err){
                console.log(err)   
            }
            
    }
}
startServer();