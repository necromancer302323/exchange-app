import { stockBalances, userBalances } from "../types/Balances";
import { Orderbook } from "../types/orderbook";

export function createAsk(
  inrBalance: userBalances[],
  stockBalance: stockBalances[],
  message: any,
  market?: "sol_usdc" | "tata",
  //@ts-ignore
  orderbook: Orderbook
) {
  function exchangingAssets(
    user_inr: number,
    user_stock: number,
    buyer_inr: number,
    buyer_stock: number,
    price: number,
    quantity: number
  ) {
    inrBalance[user_inr].balance += price * quantity;
    inrBalance[buyer_inr].balance -= price * quantity;
    stockBalance[buyer_stock].balance[market || "sol_usdc"] += quantity;
    stockBalance[user_stock].balance[market || "sol_usdc"] -= quantity;
    inrBalance[buyer_inr].Locked -= price * quantity;
  }
  if (message.orderType == "limit") {
    for (let i = 0; i < stockBalance.length; i++) {
      if (message.userId.id == stockBalance[i].userId) {
        if (
          message.price * message.quantity >
          stockBalance[i].balance[market || "sol_usdc"] - stockBalance[i].Locked
        ) {
          return { message: "insufficient funds", stockBalance };
        } else {
          let foundAMatch = false;
          const orderId = Math.random().toString();
          let executedQty = 0;
          try {
            for (let j = 0; j < orderbook.bids.length; ) {
              if (orderbook.bids[j].price == message.price) {
                const user_inr = inrBalance.findIndex((e) => {
                  return e.userId == message.userId.id;
                });
                const user_stock = stockBalance.findIndex((e) => {
                  return e.userId == message.userId.id;
                });
                const buyer_inr = inrBalance.findIndex((e) => {
                  return e.userId == orderbook.bids[j].userId;
                });
                const buyer_stock = stockBalance.findIndex((e) => {
                  return e.userId == orderbook.bids[j].userId;
                });
                foundAMatch = true;
                if (
                  orderbook.bids[j].quantity ==
                  message.quantity - executedQty
                ) {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    buyer_inr,
                    buyer_stock,
                    message.price,
                    message.quantity - executedQty
                  );
                  executedQty += message.quantity - executedQty;
                  if (executedQty != 0) {
                    stockBalance[i].Locked -= message.quantity - executedQty;
                  }
                  orderbook.bids.splice(j, 1);
                  return { message: "ask succesfull", orderId };
                } else if (
                  orderbook.bids[j].quantity >
                  message.quantity - executedQty
                ) {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    buyer_inr,
                    buyer_stock,
                    message.price,
                    message.quantity - executedQty
                  );
                  orderbook.bids[j].quantity -= message.quantity - executedQty;
                  if (executedQty != 0) {
                    stockBalance[i].Locked -= message.quantity - executedQty;
                  }
                  executedQty += message.quantity - executedQty;
                  j++;
                  return {
                    message: "ask succesfull bid changed with ask",
                    orderId,
                  };
                } else {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    buyer_inr,
                    buyer_stock,
                    message.price,
                    orderbook.bids[j].quantity
                  );
                  executedQty += orderbook.bids[j].quantity;
                  stockBalance[i].Locked +=
                    message.quantity - orderbook.bids[j].quantity;
                  orderbook.bids.splice(j, 1);
                  continue;
                }
              } else {
                j++;
              }
            }
            if (!foundAMatch) {
              let index = 0;
              while (
                index < orderbook.asks.length &&
                orderbook.asks[index].price < message.price
              ) {
                index++;
              }
              orderbook.asks.splice(index, 0, {
                price: message.price,
                quantity: message.quantity,
                orderId: orderId,
                side: "ask",
                userId: message.userId.id,
              });
              stockBalance[
                stockBalance.findIndex((e) => {
                  return e.userId == message.userId.id;
                })
              ].Locked += message.quantity;
              return { message: "ask added succesfull", orderId };
            }
            if (executedQty != 0) {
              let index = 0;
              while (
                index < orderbook.asks.length &&
                orderbook.asks[index].price < message.price
              ) {
                index++;
              }
              orderbook.asks.splice(index, 0, {
                price: message.price,
                quantity: message.quantity - executedQty,
                orderId: orderId,
                side: "ask",
                userId: message.userId.id,
              });
              return {
                message: "ask added succesfull some executed",
                orderId,
                executedQty,
              };
            }
          } catch (err) {
            console.log(err);
            return { message: "an error has occured" };
          }
        }
      }
    }
  } else {
  }
}
