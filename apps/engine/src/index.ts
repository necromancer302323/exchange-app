import { createClient } from "redis";
import { Orderbook } from "./types/orderbook";
import { userBalances } from "./types/userBalance";

const client = createClient({
  url: "redis://my-redis:6379",
});

const pubSub = createClient({
  url: "redis://pub-sub:6379",
});
const engine_pubsub = createClient({
  url: "redis://api-engine-pubsub:6379",
});

const orderbooks: Orderbook[] = [
  {
    market: "Tata",
    bids: [],
    asks: [],
  },
  {
    market: "sol_usdc",
    bids: [],
    asks: [],
  },
];
const usersBalance:userBalances[]=[{
    userId:"1",
    balance:0,
    Locked:0
},{
  userId:"2",
  balance:0,
  Locked:0
},{
  userId:"3",
  balance:0,
  Locked:0
}
]

async function startServer() {
  try {
    await client.connect();
    await pubSub.connect();
    await engine_pubsub.connect();
    console.log("Connected to Redis");
    while (true) {
      const response = await client.brPop("order", 0);
      if (!response) {
      } else {
        const message = JSON.parse(response.element);
        processingMessage(
          message.message,
          message.clientId,
          message.message.type,
          message.market
        );
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}
function processingMessage(
  message: any,
  clientId: string,
  type: string,
  market?: string
) {
  console.log(type)
  const whichMarket = orderbooks.findIndex((e) => {
    console.log(e.market == market);
    return e.market == market;
  });
  const orderbook: Orderbook = orderbooks[whichMarket==-1?0:whichMarket];
  console.log(whichMarket);

  if (type == "DEPTH") {
    try {
      engine_pubsub.publish(clientId, JSON.stringify(orderbook));
    } catch (e) {
      engine_pubsub.publish(clientId, "error");
    }
  } else if (type == "bid") {
    const orderId = Math.random().toString();
    try {
  
      orderbook.bids.push({
        price: message.price,
        quantity: message.quantity,
        orderId: orderId,
        side: "bid",
      });
      engine_pubsub.publish(
        clientId,
        JSON.stringify({ message: "bid succesfull", orderId })
      );
      pubSub.publish("order", JSON.stringify(orderbook));
    } catch (err) {
      console.log(err);
      engine_pubsub.publish(
        clientId,
        JSON.stringify({ message: "and error has occured order cancled" })
      );
    }
  } else if (type == "ask") {
    const orderId = Math.random().toString();
    try {
      orderbook.asks.push({
        price: message.price,
        quantity: message.quantity,
        orderId: orderId,
        side: "ask",
      });
      engine_pubsub.publish(
        clientId,
        JSON.stringify({ message: "ask succesfull", orderId })
      );
      pubSub.publish("order", JSON.stringify(orderbook));
    } catch (err) {
      console.log(err);
      engine_pubsub.publish(
        clientId,
        JSON.stringify({ message: "and error has occured order cancled" })
      );
    }
  }else if(type=="OnRamp"){
    console.log(message.userId)
    for(let i=0;i<usersBalance.length;i++){
      if(message.userId.id==usersBalance[i].userId&&Number(message.amount)>0){
        usersBalance[i].balance+=Number(message.amount)
        engine_pubsub.publish(
          clientId,
          JSON.stringify({ message: "added balance ",usersBalance })
        );
        break
      }
  }
  engine_pubsub.publish(
    clientId,
    JSON.stringify({ message: "added balance ",usersBalance })
  );
  }else if(type=="addUser"){
    console.log(typeof message.userId.id)
    usersBalance.push({
      userId:message.userId.id,
      balance:0,
      Locked:0
    })
    engine_pubsub.publish(
      clientId,
      JSON.stringify({ message: "user added" })
    );
  }
}
startServer();
