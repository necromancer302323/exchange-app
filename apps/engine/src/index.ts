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
        while (true){
        const response=await client.brPop("order" ,0)
        if(!response){
            
        }else{
         const message = JSON.parse(response.element)
         console.log(message)
          processingMessage(message.message,message.clientId,message.message.type)
                
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}
function processingMessage(message:Ask|Bid,clientId: string,type:string){
    console.log(message)
    if(type=="DEPTH"){
            try{
                engine_pubsub.publish(clientId,JSON.stringify(orderbook))
            }catch(e){
                engine_pubsub.publish(clientId,"error")
            }
        }
        else if(type=="bid"){
            try{
                const orderId=Math.random().toString()
                orderbook.bids.push({
                    price:message.price,
                    quantity:message.quantity,
                    orderId:orderId,
                    side:"bid"
                })
                engine_pubsub.publish(clientId,JSON.stringify({message:"bid succesfull",orderId}))
                pubSub.publish("order",JSON.stringify(orderbook))
            }catch(err){
                console.log(err)
                engine_pubsub.publish(clientId,JSON.stringify({message:"and error has occured order cancled"}))
            }
        }else if(type=="ask"){
            try{
                const orderId=Math.random().toString()
                orderbook.asks.push({
                    price:message.price,
                    quantity:message.quantity,
                    orderId:orderId,
                    side:"ask"
                })
                engine_pubsub.publish(clientId,JSON.stringify({message:"ask succesfull",orderId}))
                pubSub.publish("order",JSON.stringify(orderbook))
            }catch(err){
                console.log(err)
                engine_pubsub.publish(clientId,JSON.stringify({message:"and error has occured order cancled"}))
            }
            
    }
}
startServer();