import { stockBalances, userBalances } from "../types/Balances";
import { Orderbook } from "../types/orderbook";
//@ts-ignore
export function createbid(inrBalance: userBalances[], stockBalance: stockBalances[], message: any, market?: "sol_usdc" | "tata", orderbook: Orderbook) {
  for (let i = 0; i < inrBalance.length; i++) {
    if (inrBalance[i].userId == message.userId.id) {
      if (message.price * message.quantity > inrBalance[i].balance - inrBalance[i].Locked) {
        return { message: "insufficient funds" }
      } else {
        let foundAMatch = false;
        const orderId = Math.random().toString();
        let executedQty = 0
        try {

          for (let j = 0; j < orderbook.asks.length;) {
            if (orderbook.asks[j].price == message.price) {
              const user_inr = inrBalance.findIndex((e) => { return e.userId ==  message.userId.id  })
              const user_stock = stockBalance.findIndex((e) => { return e.userId == message.userId.id });
              const seller_inr = inrBalance.findIndex((e) => { return e.userId == orderbook.asks[j].userId })
              const seller_stock = stockBalance.findIndex((e) => { return e.userId == orderbook.asks[j].userId })
              foundAMatch = true;
              if (orderbook.asks[j].quantity == message.quantity - executedQty) {
                inrBalance[user_inr].balance -= message.price *(message.quantity - executedQty)
                inrBalance[seller_inr].balance += message.price * (message.quantity - executedQty)
                stockBalance[user_stock].balance[market || "sol_usdc"] += message.quantity - executedQty
                stockBalance[seller_stock].balance[market || "sol_usdc"] -=message.quantity - executedQty
                stockBalance[seller_stock].Locked -= message.quantity - executedQty
                if(executedQty!=0){
                  inrBalance[user_inr].Locked-=message.price *(message.quantity - executedQty)
                }
                orderbook.asks.splice(j, 1);
                executedQty += message.quantity -executedQty
                return { message: "bid succesfull", executedQty }
              } else if (orderbook.asks[j].quantity > message.quantity - executedQty) {
                inrBalance[user_inr].balance -= message.price * (message.quantity - executedQty)
                inrBalance[seller_inr].balance += message.price *(message.quantity - executedQty)
                stockBalance[user_stock].balance[market || "sol_usdc"] += message.quantity - executedQty
                stockBalance[seller_stock].balance[market || "sol_usdc"] -= message.quantity - executedQty
                orderbook.asks[j].quantity -= message.quantity 
                stockBalance[seller_stock].Locked -= message.quantity - executedQty
                if(executedQty!=0){
                  inrBalance[user_inr].Locked-=message.price *(message.quantity - executedQty)
                }
                executedQty += message.quantity
                j++
                return { message: "bid succesfull  ask changed with bid", orderId, executedQty }
              } else {
                inrBalance[user_inr].balance -= message.price * orderbook.asks[j].quantity
                inrBalance[seller_inr].balance += message.price * orderbook.asks[j].quantity
                stockBalance[user_stock].balance[market || "sol_usdc"] += orderbook.asks[j].quantity
                stockBalance[seller_stock].balance[market || "sol_usdc"] -= orderbook.asks[j].quantity
                stockBalance[seller_stock].Locked -= orderbook.asks[j].quantity
                inrBalance[user_inr].Locked += message.price * (message.quantity - orderbook.asks[j].quantity)
                executedQty += orderbook.asks[j].quantity
                orderbook.asks.splice(j, 1);
                continue;
              }
            }else{
              j++
            }
          }
          if (executedQty!=0) {
            let index=0
            while(index<orderbook.bids.length&&orderbook.bids[index].price<message.price){
              index++
            }
            orderbook.bids.splice(index,0,{
              price: message.price,
              quantity: message.quantity - executedQty,
              orderId: orderId,
              side: "bid",
              userId: message.userId.id
            });
            
            return { message: "ask added succesfull some executed", orderId, executedQty }
          }
          if (!foundAMatch) {
            let index=0
            while(index<orderbook.bids.length&&orderbook.bids[index].price<message.price){
              index++
            }
            orderbook.bids.splice(index,0,{
              price: message.price,
              quantity: message.quantity,
              orderId: orderId,
              side: "bid",
              userId: message.userId.id
            });
            inrBalance[i].Locked += message.price * message.quantity
            return {
              message: "bid succesfull",
              orderId,
              executedQty
            }
          } 
        } catch (err) {
          console.log(err);
          return { message: "and error has occured order cancled" }
        }
        if(executedQty!=message.quantity){
          return { message: "ask added succesfull some executed", orderId, executedQty }
        }
      }
    }
  }
}

//@ts-ignore
export function createAsk(inrBalance: userBalances[], stockBalance: stockBalances[], message: any, market?: "sol_usdc" | "tata", orderbook: Orderbook) {
  for (let i = 0; i < stockBalance.length; i++) {
    if (message.userId.id == stockBalance[i].userId) {
      if (message.price * message.quantity > stockBalance[i].balance[market || "sol_usdc"] - stockBalance[i].Locked) {

        return { message: "insufficient funds" ,stockBalance}

      } else {
        let foundAMatch = false;
        const orderId = Math.random().toString();
        let executedQty = 0
        try {
          for (let j = 0; j < orderbook.bids.length;) {
            if (orderbook.bids[j].price == message.price) {
              const user_stock = stockBalance.findIndex((e) => { return e.userId == message.userId.id })
              const user_inr = inrBalance.findIndex((e) => { return e.userId == message.userId.id })
              const buyer_inr = inrBalance.findIndex((e) => { return e.userId == orderbook.bids[j].userId })
              const buyer_stock = stockBalance.findIndex((e) => { return e.userId == orderbook.bids[j].userId })
              foundAMatch = true
              if (orderbook.bids[j].quantity == message.quantity - executedQty) {
                inrBalance[user_inr].balance += message.price * (message.quantity - executedQty)
                inrBalance[buyer_stock].balance -= message.price * (message.quantity - executedQty)
                stockBalance[buyer_stock].balance[market || "sol_usdc"] += message.quantity - executedQty
                stockBalance[user_stock].balance[market || "sol_usdc"] -=message.quantity - executedQty
                inrBalance[buyer_inr].Locked -=  message.price* (message.quantity - executedQty)
                executedQty += message.quantity -executedQty
                if(executedQty!=0){
                  stockBalance[user_stock].Locked -= message.quantity - executedQty
                }
                orderbook.bids.splice(j, 1);
                return { message: "ask succesfull", orderId }
              } else if (orderbook.bids[j].quantity > message.quantity - executedQty) {
                inrBalance[user_inr].balance += message.price * (message.quantity - executedQty)
                inrBalance[buyer_inr].balance -= message.price *(message.quantity - executedQty)
                stockBalance[buyer_stock].balance[market || "sol_usdc"] += (message.quantity - executedQty)
                stockBalance[user_stock].balance[market || "sol_usdc"] -=(message.quantity - executedQty)
                orderbook.bids[j].quantity -= message.quantity- executedQty
                inrBalance[buyer_inr].Locked -= message.price* (message.quantity - executedQty)
                if(executedQty!=0){
                  stockBalance[user_stock].Locked -=message.quantity - executedQty
                }
                executedQty += message.quantity -executedQty
                j++
                  return { message: "ask succesfull bid changed with ask", orderId }
              } else {
                inrBalance[user_inr].balance += message.price * orderbook.bids[j].quantity
                inrBalance[buyer_inr].balance -= message.price * orderbook.bids[j].quantity
                stockBalance[buyer_stock].balance[market || "sol_usdc"] += orderbook.bids[j].quantity
                stockBalance[user_stock].balance[market || "sol_usdc"] -= orderbook.bids[j].quantity
                stockBalance[user_stock].Locked += message.price * (message.quantity - orderbook.bids[j].quantity)
                inrBalance[buyer_inr].Locked -= message.quantity * orderbook.bids[j].quantity
                executedQty += orderbook.bids[j].quantity
                  stockBalance[user_stock].Locked += message.quantity - orderbook.bids[j].quantity
                orderbook.bids.splice(j, 1);
              }
            }else{
              j++
            }
          }
          if (!foundAMatch) {
            let index=0
            while(index<orderbook.asks.length&&orderbook.asks[index].price<message.price){
              index++
            }
            orderbook.asks.splice(index,0,{
              price: message.price,
              quantity: message.quantity,
              orderId: orderId,
              side: "ask",
              userId: message.userId.id
            });
            stockBalance[stockBalance.findIndex((e) => { return e.userId == message.userId.id })].Locked += message.quantity
            return { message: "ask added succesfull", orderId }
          }
          if (executedQty != 0) {
            let index=0
            while(index<orderbook.asks.length&&orderbook.asks[index].price<message.price){
              index++
            }
            orderbook.asks.splice(index,0,{
              price: message.price,
              quantity: message.quantity -executedQty,
              orderId: orderId,
              side: "ask",
              userId: message.userId.id
            });
            return { message: "ask added succesfull some executed", orderId, executedQty }
          }
          
       
        } catch (err) {
          console.log(err)
          return { message: "an error has occured" }
        }

      }
    }
  }
}