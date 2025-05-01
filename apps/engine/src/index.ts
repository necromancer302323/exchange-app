import { createClient } from "redis";
import { Orderbook } from "./types/orderbook";
import { stockBalances, userBalances } from "./types/Balances";

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
    bids:[],
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
  console.log(type);
  const whichMarket = orderbooks.findIndex((e) => {
    console.log(e.market == market);
    return e.market == market;
  });
  const orderbook: Orderbook = orderbooks[whichMarket == -1 ? 0 : whichMarket];
  console.log(whichMarket);

  if (type == "DEPTH") {
    try {
      engine_pubsub.publish(clientId, JSON.stringify(orderbook));
    } catch (e) {
      engine_pubsub.publish(clientId, "error");
    }
  } else if (type == "bid") {
    for (let i=0;i<inrBalance.length;i++){
      if(inrBalance[i].userId!=message.userId.id){
        
      }else{
      if(message.price*message.quantity>inrBalance[i].balance-inrBalance[i].Locked){
        engine_pubsub.publish(
          clientId,
          JSON.stringify({ message: "insufficient funds" })
        );
        break
      }else{
        let foundAMatch=false;
        const orderId = Math.random().toString();
        try {
          for(let i=0;i<orderbook.asks.length;i++){
            if(orderbook.asks[i].price == message.price){
            foundAMatch=true;
              if (orderbook.asks[i].quantity == message.quantity) {
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance-=message.price*message.quantity
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance+=message.price*message.quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]+=message.quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance[market||"sol_usdc"]-=message.quantity
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=0
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].Locked=0
                orderbook.asks.splice(i, 1);
                pubSub.publish("order", JSON.stringify(orderbook));
                engine_pubsub.publish(
                  clientId,
                  JSON.stringify({ message: "bid succesfull", orderId })
                );
              }else if(orderbook.asks[i].quantity >= message.quantity){
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance-=message.price*message.quantity
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance+=message.price*message.quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]+=message.quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance[market||"sol_usdc"]-=message.quantity
                orderbook.asks[i].quantity-=message.quantity
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=0
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].Locked-=message.quantity*message.price
                pubSub.publish("order", JSON.stringify(orderbook));
                engine_pubsub.publish(
                  clientId,
                  JSON.stringify({ message: "bid succesfull  ask changed with bid", orderId })

                );
              }else{
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance-=message.price*orderbook.asks[i].quantity
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance+=message.price*orderbook.asks[i].quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]+=orderbook.asks[i].quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].balance[market||"sol_usdc"]-=orderbook.asks[i].quantity
                stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.asks[i].userId})].Locked=0
                inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=message.price*message.quantity-orderbook.asks[i].quantity
                orderbook.bids.push({
                  price: message.price,
                  quantity: message.quantity-orderbook.asks[i].quantity,
                  orderId: orderId,
                  side: "bid",
                  userId:message.userId.id
                });
                orderbook.asks.splice(i,1)
                pubSub.publish("order", JSON.stringify(orderbook));
                engine_pubsub.publish(
                  clientId,
                  JSON.stringify({ message: "ask added succesfull some executed", orderId })
                );
              }
            }
          }
          console.log(foundAMatch)
          if(!foundAMatch){
            orderbook.bids.push({
              price: message.price,
              quantity: message.quantity,
              orderId: orderId,
              side: "bid",
              userId:message.userId.id
            });
            inrBalance[i].Locked=message.quantity-orderbook.asks[i].quantity
            engine_pubsub.publish(
              clientId,
              JSON.stringify({
                message: "bid succesfull",
                orderId,
                inrBalance,
              })
            );
            pubSub.publish("order", JSON.stringify(orderbook));
          }
        } catch (err) {
          console.log(err);
          engine_pubsub.publish(
            clientId,
            JSON.stringify({ message: "and error has occured order cancled" })
          );
        }
      }
    }
  }

  } else if (type == "ask") {
    for (let i = 0; i < stockBalance.length; i++) {
      if (message.userId.id != stockBalance[i].userId) {

      }else{
        console.log("in here")
        console.log(stockBalance[i].balance[market||"sol_usdc"] - stockBalance[i].Locked)
        if (message.price * message.quantity >stockBalance[i].balance[market||"sol_usdc"] - stockBalance[i].Locked) {
          engine_pubsub.publish(
            clientId,
            JSON.stringify({ message: "insufficient funds" })
          );
        } else {
          let foundAMatch=false;
          const orderId = Math.random().toString();
          try {
            for (let i = 0;i < orderbook.bids.length;i++) {
              if (orderbook.bids[i].price == message.price) {
                foundAMatch=true
                if (orderbook.bids[i].quantity == message.quantity) {
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance+=message.price*message.quantity
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance-=message.price*message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance[market||"sol_usdc"]+=message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]-=message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=0
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].Locked=0
                  orderbook.bids.splice(i, 1);
                  pubSub.publish("order", JSON.stringify(orderbook));
                  engine_pubsub.publish(
                    clientId,
                    JSON.stringify({ message: "ask succesfull", orderId })
                  );
                } else if (orderbook.bids[i].quantity > message.quantity) {
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance+=message.price*message.quantity
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance-=message.price*message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance[market||"sol_usdc"]+=message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]-=message.quantity
                  orderbook.bids[i].quantity-=message.quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=0
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].Locked=message.quantity*message.price
                  pubSub.publish("order", JSON.stringify(orderbook));
                  engine_pubsub.publish(
                    clientId,
                    JSON.stringify({ message: "ask succesfull bid changed with ask", orderId })

                  );
                } else {
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance+=message.price*orderbook.bids[i].quantity
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance-=message.price*orderbook.bids[i].quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].balance[market||"sol_usdc"]+=orderbook.bids[i].quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].balance[market||"sol_usdc"]-=orderbook.bids[i].quantity
                  stockBalance[stockBalance.findIndex((e)=>{return e.userId==message.userId.id})].Locked=message.quantity*message.price-orderbook.bids[i].quantity
                  inrBalance[inrBalance.findIndex((e)=>{return e.userId==orderbook.bids[i].userId})].Locked=0
                  orderbook.asks.push({
                    price: message.price,
                    quantity: message.quantity-orderbook.bids[i].quantity,
                    orderId: orderId,
                    side: "ask",
                    userId:message.userId.id
                  });
                 stockBalance[i].Locked=message.quantity-orderbook.bids[i].quantity
                  orderbook.bids.splice(i, 1);
                  engine_pubsub.publish(
                    clientId,
                    JSON.stringify({ message: "ask added succesfull some executed", orderId })
                  );
                  pubSub.publish("order", JSON.stringify(orderbook));
                }
              }              
            }
            if(!foundAMatch){
              orderbook.asks.push({
                price: message.price,
                quantity: message.quantity,
                orderId: orderId,
                side: "ask",
                userId:message.userId.id
              });
              stockBalance[i].Locked=message.quantity-orderbook.bids[i].quantity
              pubSub.publish("order", JSON.stringify(orderbook));
              engine_pubsub.publish(
                clientId,
                JSON.stringify({ message: "ask added succesfull", orderId })
              );
            }
          } catch (err) {
            console.log(err)
            engine_pubsub.publish(
              clientId,
              JSON.stringify({ message: "an error has occured" })
            );
          }
          
        }
      }
    }
  } else if (type == "OnRamp") {
    console.log(message.userId);
    for (let i = 0; i < inrBalance.length; i++) {
      if (
        message.userId.id == inrBalance[i].userId &&
        Number(message.amount) > 0
      ) {
        inrBalance[i].balance += Number(message.amount);
        engine_pubsub.publish(
          clientId,
          JSON.stringify({ message: "added balance ", inrBalance })
        );
        break;
      }
    }
    
  } else if (type == "OnRamp-Stocks") {
    console.log(message.userId);
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
  } else if (type == "addUser") {
    console.log(typeof message.userId.id);
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
    engine_pubsub.publish(clientId, JSON.stringify({ message: "user added" }));
  }
}
startServer();
