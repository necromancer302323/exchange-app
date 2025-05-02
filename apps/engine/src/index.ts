import { createClient } from "redis";
import { Orderbook } from "./types/orderbook";
import { stockBalances, userBalances } from "./types/Balances";
import { createAsk, createbid } from "./functions/createOrders";

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
const inrBalance: userBalances[] = [
  {
    userId: "1",
    balance: 0,
    Locked: 0,
  },
  {
    userId: "2",
    balance: 0,
    Locked: 0,
  },
  {
    userId: "3",
    balance: 0,
    Locked: 0,
  },
];
const stockBalance: stockBalances[] = [
  {
    userId: "1",
    balance: {
      sol_usdc: 10,
      tata: 10,
    },
    Locked: 0,
  },
];

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
  market?: "sol_usdc" | "tata"
) {
  const whichMarket = orderbooks.findIndex((e) => {
    return e.market == market;
  });
  const orderbook: Orderbook = orderbooks[whichMarket == -1 ? 0 : whichMarket];
  if(type=="DEPTH"){
      try {
        engine_pubsub.publish(clientId, JSON.stringify(orderbook));
      } catch (e) {
        engine_pubsub.publish(clientId, "error");
      }
    }
    else if(type=="bid"){
      const response=createbid(inrBalance,stockBalance,message,market,orderbook)
      engine_pubsub.publish(
        clientId,
        JSON.stringify(response)
      );
      if(response?.message!="insufficient funds"){
        pubSub.publish("order", JSON.stringify(orderbook));
      }
    }
      else if(type=="ask"){
        const response=  createAsk(inrBalance,stockBalance,message,market,orderbook)
        engine_pubsub.publish(
          clientId,
          JSON.stringify(response)
        );
        pubSub.publish("order", JSON.stringify(orderbook));
    }
      else if(type=="OnRamp"){
      for (let i = 0; i < inrBalance.length; i++) {
        if (message.userId.id == inrBalance[i].userId && Number(message.amount) > 0) {
          inrBalance[i].balance += Number(message.amount);
          engine_pubsub.publish(
            clientId,
            JSON.stringify({ message: "added balance ", inrBalance })
          );
          break;
        }
      }
    }
      else if(type=="OnRamp-Stocks"){
      for (let i = 0; i < stockBalance.length; i++) {
        if (
          message.userId.id == stockBalance[i].userId &&
          Number(message.amount) > 0
        ) {
          if (!market) {
            engine_pubsub.publish(
              clientId,
              JSON.stringify({ message: "market not found " })
            );
          } else {
            stockBalance[i].balance[market] += Number(message.amount);
            engine_pubsub.publish(
              clientId,
              JSON.stringify({ message: "added balance ", stockBalance })
            );
            break;
          }
        }
      }
      engine_pubsub.publish(
        clientId,
        JSON.stringify({ message: "added balance ", inrBalance })
      );
    }
      else if(type=="addUser"){
      inrBalance.push({
        userId: message.userId.id,
        balance: 0,
        Locked: 0,
      });
      stockBalance.push({
        userId: message.userId.id,
        balance: {
          sol_usdc: 10,
          tata: 10,
        },
        Locked: 0,
      });
      engine_pubsub.publish(clientId, JSON.stringify({ message: "user added",inrBalance }));
  }
}
startServer();