import { stockBalances, userBalances } from "../types/Balances";
import { Orderbook } from "../types/orderbook";
export function createbid(
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
    seller_inr: number,
    seller_stock: number,
    price: number,
    quantity: number
  ) {
    inrBalance[user_inr].balance -= price * quantity;
    inrBalance[seller_inr].balance += price * quantity;
    stockBalance[user_stock].balance[market || "sol_usdc"] += quantity;
    stockBalance[seller_stock].balance[market || "sol_usdc"] -= quantity;
    stockBalance[seller_stock].Locked -= quantity;
  }
  if (message.orderType == "limit") {
    for (let i = 0; i < inrBalance.length; i++) {
      if (inrBalance[i].userId == message.userId.id) {
        if (
          message.price * message.quantity >
          inrBalance[i].balance - inrBalance[i].Locked
        ) {
          return { message: "insufficient funds" };
        } else {
          let foundAMatch = false;
          const orderId = Math.random().toString();
          let executedQty = 0;
          try {
            for (let j = 0; j < orderbook.asks.length; ) {
              if (orderbook.asks[j].price == message.price) {
                const user_inr = inrBalance.findIndex((e) => {
                  return e.userId == message.userId.id;
                });
                const user_stock = stockBalance.findIndex((e) => {
                  return e.userId == message.userId.id;
                });
                const seller_inr = inrBalance.findIndex((e) => {
                  return e.userId == orderbook.asks[j].userId;
                });
                const seller_stock = stockBalance.findIndex((e) => {
                  return e.userId == orderbook.asks[j].userId;
                });
                foundAMatch = true;
                if (
                  orderbook.asks[j].quantity ==
                  message.quantity - executedQty
                ) {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    seller_inr,
                    seller_stock,
                    message.price,
                    message.quantity - executedQty
                  );
                  if (executedQty != 0) {
                    inrBalance[user_inr].Locked -=
                      message.price * (message.quantity - executedQty);
                  }
                  orderbook.asks.splice(j, 1);
                  return { message: "bid succesfull" };
                } else if (
                  orderbook.asks[j].quantity >
                  message.quantity - executedQty
                ) {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    seller_inr,
                    seller_stock,
                    message.price,
                    message.quantity - executedQty
                  );
                  orderbook.asks[j].quantity -= message.quantity;
                  if (executedQty != 0) {
                    inrBalance[user_inr].Locked -=
                      message.price * (message.quantity - executedQty);
                  }
                  return {
                    message: "bid succesfull  ask changed with bid",
                    orderId,
                    executedQty,
                  };
                } else {
                  exchangingAssets(
                    user_inr,
                    user_stock,
                    seller_inr,
                    seller_stock,
                    message.price,
                    orderbook.asks[j].quantity
                  );
                  executedQty += orderbook.asks[j].quantity;
                  inrBalance[user_inr].Locked +=
                    message.price * (message.quantity - executedQty);
                  orderbook.asks.splice(j, 1);
                  continue;
                }
              } else {
                j++;
              }
            }
            if (executedQty != 0) {
              let index = 0;
              while (
                index < orderbook.bids.length &&
                orderbook.bids[index].price < message.price
              ) {
                index++;
              }
              orderbook.bids.splice(index, 0, {
                price: message.price,
                quantity: message.quantity - executedQty,
                orderId: orderId,
                side: "bid",
                userId: message.userId.id,
              });

              return {
                message: "bid added succesfull some executed",
                orderId,
                executedQty,
              };
            }
            if (!foundAMatch) {
              let index = 0;
              while (
                index < orderbook.bids.length &&
                orderbook.bids[index].price < message.price
              ) {
                index++;
              }
              orderbook.bids.splice(index, 0, {
                price: message.price,
                quantity: message.quantity,
                orderId: orderId,
                side: "bid",
                userId: message.userId.id,
              });
              inrBalance[i].Locked += message.price * message.quantity;
              return {
                message: "bid succesfull",
                orderId,
                executedQty,
              };
            }
          } catch (err) {
            console.log(err);
            return { message: "and error has occured order cancled" };
          }
          if (executedQty != message.quantity) {
            return {
              message: "ask added succesfull some executed",
              orderId,
              executedQty,
            };
          }
        }
      } else {
        if (inrBalance[i] == inrBalance[inrBalance.length - 1]) {
          return { message: "user not found" };
        }
      }
    }
  } else {
    for (let i = 0; i < inrBalance.length; i++) {
      if (inrBalance[i].userId == message.userId.id) {
        let executedQty = 0;
        const orderId = Math.random().toString();
        try {
          let total_quantity = 0;
          let total_price = 0;
          let last_price = 0;
          for (let j = 0; j < orderbook.asks.length; ) {
            const user_inr = inrBalance.findIndex((e) => {
              return e.userId == message.userId.id;
            });
            const user_stock = stockBalance.findIndex((e) => {
              return e.userId == message.userId.id;
            });
            total_quantity += orderbook.asks[j].quantity;
            if (message.quantity > orderbook.asks[j].quantity) {
              total_price =
                orderbook.asks[j].price * orderbook.asks[j].quantity;
            } else {
              total_price = orderbook.asks[j].price * message.quantity;
            }
            if (message.quantity == total_quantity) {
              if (total_price > inrBalance[i].balance - inrBalance[i].Locked) {
                return { message: "insufficient funds" };
              } else {
                try {
                  for (let k = 0; k <= j; k++) {
                    const seller_inr = inrBalance.findIndex((e) => {
                      return e.userId == orderbook.asks[k].userId;
                    });
                    const seller_stock = stockBalance.findIndex((e) => {
                      return e.userId == orderbook.asks[k].userId;
                    });
                    exchangingAssets(
                      user_inr,
                      user_stock,
                      seller_inr,
                      seller_stock,
                      orderbook.asks[0].price,
                      orderbook.asks[0].quantity
                    );
                    executedQty += orderbook.asks[0].quantity;
                    total_price -= orderbook.asks[0].quantity;
                    orderbook.asks.splice(0, 1);
                    if (k == j) {
                      return { message: "bid succesfull", executedQty };
                    }
                    continue;
                  }
                } catch (err) {}
              }
            } else if (message.quantity < total_quantity) {
              if (total_price > inrBalance[i].balance - inrBalance[i].Locked) {
                return { message: "insufficient funds" };
              } else {
                for (let k = 0; k <= j; k++) {
                  const seller_inr = inrBalance.findIndex((e) => {
                    return e.userId == orderbook.asks[0].userId;
                  });
                  const seller_stock = stockBalance.findIndex((e) => {
                    return e.userId == orderbook.asks[0].userId;
                  });
                  if (k != j || j == 0) {
                    exchangingAssets(
                      user_inr,
                      user_stock,
                      seller_inr,
                      seller_stock,
                      orderbook.asks[0].price,
                      orderbook.asks[0].quantity
                    );
                    total_quantity -= orderbook.asks[0].quantity;
                    orderbook.asks.splice(0, 1);
                    continue;
                  } else {
                    exchangingAssets(
                      user_inr,
                      user_stock,
                      seller_inr,
                      seller_stock,
                      orderbook.asks[0].price,
                      total_quantity - message.quantity
                    );
                    orderbook.asks[j].quantity -=
                      total_quantity - message.quantity;
                    total_quantity -= orderbook.asks[0].quantity;
                  }
                }
                return {
                  message: "bid succesfull  ask changed with bid",
                  orderId,
                  executedQty,
                };
              }
            } else {
              if (
                j == orderbook.asks.length - 1 ||
                orderbook.asks.length == 0
              ) {
                if (
                  total_price * total_quantity >
                  inrBalance[i].balance - inrBalance[i].Locked
                ) {
                  return { message: "insufficient funds" };
                } else {
                  for (let k = 0; k <= j; k++) {
                    const seller_inr = inrBalance.findIndex((e) => {
                      return e.userId == orderbook.asks[k].userId;
                    });
                    const seller_stock = stockBalance.findIndex((e) => {
                      return e.userId == orderbook.asks[k].userId;
                    });

                    exchangingAssets(
                      user_inr,
                      user_stock,
                      seller_inr,
                      seller_stock,
                      orderbook.asks[0].price,
                      orderbook.asks[0].quantity
                    );

                    inrBalance[user_inr].Locked +=
                      message.price *
                      (message.quantity - orderbook.asks[0].quantity);
                    executedQty += orderbook.asks[0].quantity;
                    last_price = orderbook.asks[0].price;
                    total_quantity -= orderbook.asks[0].quantity;
                    orderbook.asks.splice(0, 1);
                    continue;
                  }
                  orderbook.bids.splice(0, 0, {
                    price: last_price || 10,
                    quantity: message.quantity - executedQty,
                    orderId: orderId,
                    side: "bid",
                    userId: message.userId.id,
                  });

                  return {
                    message: "bid added succesfull some executed",
                    orderId,
                    executedQty,
                  };
                }
              }
              j++;
            }
            return { message: "no bids found cant place a market order" };
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}
