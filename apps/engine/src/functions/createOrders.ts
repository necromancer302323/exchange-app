import { stockBalances, userBalances } from "../types/Balances";
import { Orderbook } from "../types/orderbook";
//@ts-ignore
export function createbid(inrBalance:userBalances[],stockBalance:stockBalances[],message:any,market?:"sol_usdc"|"tata",orderbook:Orderbook){
    for (let i = 0; i < inrBalance.length; i++) {
      console.log(message,"avcd")
        if (inrBalance[i].userId == message.userId.id) {
          if (message.price * message.quantity > inrBalance[i].balance - inrBalance[i].Locked) {
           return {message:"insufficient funds"}
          } else {
            let foundAMatch = false;
            const orderId = Math.random().toString();
            try {
              for (let i = 0; i < orderbook.asks.length; i++) {
                if (orderbook.asks[i].price == message.price) {
                  const user_inr=inrBalance.findIndex((e) => { return e.userId == message.userId.id })
                  const user_stock=stockBalance.findIndex((e) => { return e.userId == message.userId.id });
                  const seller_inr=inrBalance.findIndex((e) => { return e.userId == orderbook.asks[i].userId })
                  const seller_stock=stockBalance.findIndex((e) => { return e.userId == orderbook.asks[i].userId })
                  foundAMatch = true;
                  if (orderbook.asks[i].quantity == message.quantity) {
                    inrBalance[user_inr].balance -= message.price * message.quantity
                    inrBalance[seller_inr].balance += message.price * message.quantity
                    stockBalance[user_stock].balance[market || "sol_usdc"] += message.quantity
                    stockBalance[seller_stock].balance[market || "sol_usdc"] -= message.quantity
                    stockBalance[seller_stock].Locked -= message.quantity
                    orderbook.asks.splice(i, 1);
                   return {message:"bid succesfull"}
                  } else if (orderbook.asks[i].quantity >= message.quantity) {
                    inrBalance[user_inr].balance -= message.price * message.quantity
                    inrBalance[seller_inr].balance += message.price * message.quantity
                    stockBalance[user_stock].balance[market || "sol_usdc"] += message.quantity
                    stockBalance[seller_stock].balance[market || "sol_usdc"] -= message.quantity
                    orderbook.asks[i].quantity -= message.quantity
                    stockBalance[seller_stock].Locked -= message.quantity
                   return { message: "bid succesfull  ask changed with bid", orderId }
                  } else {
                    inrBalance[user_inr].balance -= message.price * orderbook.asks[i].quantity
                    inrBalance[seller_inr].balance += message.price * orderbook.asks[i].quantity
                    stockBalance[user_stock].balance[market || "sol_usdc"] += orderbook.asks[i].quantity
                    stockBalance[seller_stock].balance[market || "sol_usdc"] -= orderbook.asks[i].quantity
                    stockBalance[seller_stock].Locked -= orderbook.asks[i].quantity
                    inrBalance[user_inr].Locked += message.price * (message.quantity - orderbook.asks[i].quantity)
                    orderbook.bids.push({
                      price: message.price,
                      quantity: message.quantity - orderbook.asks[i].quantity,
                      orderId: orderId,
                      side: "bid",
                      userId: message.userId.id
                    });
                    orderbook.asks.splice(i, 1)
                   return { message: "ask added succesfull some executed", orderId }
                  }
                }
              }
              console.log(foundAMatch)
              if (!foundAMatch) {
                orderbook.bids.push({
                  price: message.price,
                  quantity: message.quantity,
                  orderId: orderId,
                  side: "bid",
                  userId: message.userId.id
                });
                inrBalance[i].Locked += message.price * message.quantity
              return{
                    message: "bid succesfull",
                    orderId,
                    inrBalance,
                  }
              }
            } catch (err) {
              console.log(err);
              return { message: "and error has occured order cancled" }
            }
          }
        }
      }
}

//@ts-ignore
export function createAsk(inrBalance:userBalances[],stockBalance:stockBalances[],message:any,market?:"sol_usdc"|"tata",orderbook:Orderbook){
  for (let i = 0; i < stockBalance.length; i++) {
    if (message.userId.id == stockBalance[i].userId) {
      if (message.price * message.quantity > stockBalance[i].balance[market || "sol_usdc"] - stockBalance[i].Locked) {
       
          return JSON.stringify({ message: "insufficient funds" })

      } else {
        let foundAMatch = false;
        const orderId = Math.random().toString();
        try {
          for (let i = 0; i < orderbook.bids.length; i++) {
            if (orderbook.bids[i].price == message.price) {
              const user_stock= stockBalance.findIndex((e) => { return e.userId == message.userId.id })
              const user_inr=inrBalance.findIndex((e) => { return e.userId == message.userId.id })
              const buyer_stock= inrBalance.findIndex((e) => { return e.userId == orderbook.bids[i].userId })
              const buyer_inr=stockBalance.findIndex((e) => { return e.userId == orderbook.bids[i].userId })
              foundAMatch = true
              if (orderbook.bids[i].quantity == message.quantity) {
                inrBalance[user_inr].balance += message.price * message.quantity
                inrBalance[buyer_stock].balance -= message.price * message.quantity
                stockBalance[buyer_inr].balance[market || "sol_usdc"] += message.quantity
                stockBalance[user_stock].balance[market || "sol_usdc"] -= message.quantity
                stockBalance[user_stock].Locked -= message.quantity
                orderbook.bids.splice(i, 1);
                return { message: "ask succesfull", orderId }
              } else if (orderbook.bids[i].quantity > message.quantity) {
                inrBalance[user_inr].balance += message.price * message.quantity
                inrBalance[buyer_stock].balance -= message.price * message.quantity
                stockBalance[buyer_inr].balance[market || "sol_usdc"] += message.quantity
                stockBalance[user_stock].balance[market || "sol_usdc"] -= message.quantity
                orderbook.bids[i].quantity -= message.quantity
                inrBalance[buyer_stock].Locked += message.quantity * message.price
                return { message: "ask succesfull bid changed with ask", orderId }
              } else {
                inrBalance[user_inr].balance += message.price * orderbook.bids[i].quantity
                inrBalance[buyer_stock].balance -= message.price * orderbook.bids[i].quantity
                stockBalance[buyer_inr].balance[market || "sol_usdc"] += orderbook.bids[i].quantity
                stockBalance[user_stock].balance[market || "sol_usdc"] -= orderbook.bids[i].quantity
                stockBalance[user_stock].Locked += message.price * (message.quantity - orderbook.bids[i].quantity)
                inrBalance[buyer_stock].Locked -= message.quantity * message.price
                orderbook.asks.push({
                  price: message.price,
                  quantity: message.quantity - orderbook.bids[i].quantity,
                  orderId: orderId,
                  side: "ask",
                  userId: message.userId.id
                });
                stockBalance[user_stock].Locked += message.quantity - orderbook.bids[i].quantity
                orderbook.bids.splice(i, 1);
                return { message: "ask added succesfull some executed", orderId }
              }
            }
          }
          if (!foundAMatch) {
            orderbook.asks.push({
              price: message.price,
              quantity: message.quantity,
              orderId: orderId,
              side: "ask",
              userId: message.userId.id
            });
            stockBalance[stockBalance.findIndex((e) => { return e.userId == message.userId.id })].Locked += message.quantity
            return { message: "ask added succesfull", orderId }
          }
        } catch (err) {
          console.log(err)
          return { message: "an error has occured" }
        }

      }
    }
  }
}