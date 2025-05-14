import axios from "axios";
import { useEffect, useState } from "react";
import { useGetDepth, useGetUsersBalance } from "./utils/Hooks";
import { useSearchParams } from "react-router-dom";
import { OrderBook } from "../components/Orderbook";
import { UsersBalance } from "../components/usersBalance";

export const Homepage = () => {
  const [orderBook, setOrderBook] = useState<any>();
  const [price, setPrice] = useState("0");
  const [quantity, setQuantity] = useState("0");
  const [amount, setAmount] = useState("0");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [searchParams, setSearchParams] = useSearchParams();
  const [usersBalance, setUsersBalance] = useState<any>();
  const balance = useGetUsersBalance();
  const data = useGetDepth(searchParams.get("market") || "");
  const socket = new WebSocket("ws://localhost:8080");
  socket.onmessage = function (message) {
    setOrderBook(JSON.parse(message.data));
  };
  useEffect(() => {
    setOrderBook(data);
  }, [data]);
  useEffect(() => {
    setUsersBalance(balance);
  }, [balance]);
  async function onRamp() {
    const response: any = await axios.post(
      `http://localhost:3000/api/v1/onRamp`,
      {
        amount,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    alert(response.data.message);
  }
  async function buy() {
    if (orderType == "limit" && Number(price) != 0 && Number(quantity) != 0) {
      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          price: Number(price),
          quantity: Number(quantity),
          type: "bid",
          orderType: orderType,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log(response.data.message);
      alert(response.data.message);
    } else {
      if (Number(quantity) != 0) {
        const response: any = await axios.post(
          `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
          {
            quantity: Number(quantity),
            type: "bid",
            orderType: orderType,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        console.log(response.data.message);
        alert(response.data.message);
      }
    }
  }

  async function sell() {
    if (orderType == "limit" && Number(price) != 0 && Number(quantity) != 0) {
      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          price: Number(price),
          quantity: Number(quantity),
          type: "ask",
          orderType: orderType,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      alert(response.data.message);
    } else {
      if (Number(quantity) != 0) {
        const response: any = await axios.post(
          `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
          {
            quantity: Number(quantity),
            type: "ask",
            orderType: orderType,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        );
        alert(response.data.message);
      }
    }
  }
  return (
    <div>
      <div className="w-full h-full grid grid-cols-2">
        <div></div>
        <div className="grid grid-cols-3 gap-3">
          <div>{OrderBook(orderBook)}</div>
          <div className="flex flex-col gap-2">
            <div className="mt-20 mr-2 rounded-lg bg-slate-800 p-1.5 gap-2 flex flex-col text-white w-72">
              <div className="grid grid-cols-2 gap-1">
                <button
                  className="justify-center rounded-lg h-11 bg-slate-700 hover:bg-slate-500 hover:cursor-pointer "
                  onClick={() => {
                    setOrderType("limit");
                  }}
                >
                  limit
                </button>
                <button
                  className="justify-center rounded-lg h-11 bg-slate-700 hover:bg-slate-500 hover:cursor-pointer "
                  onClick={() => {
                    setOrderType("market");
                  }}
                >
                  market
                </button>
              </div>
              {orderType == "limit" && (
                <>
                  {" "}
                  <label className="text-sm">Price</label>
                  <input
                    onChange={(e) => {
                      setPrice(e.target.value);
                    }}
                    defaultValue="127.38"
                    className="bg-slate-700 border border-slate-500 w-36 h-12 p-4 ml-3 rounded-md"
                  ></input>{" "}
                </>
              )}
              <label className="text-sm">Quantity</label>
              <input
                onChange={(e) => {
                  setQuantity(e.target.value);
                }}
                defaultValue="0"
                className="bg-slate-700 border border-slate-500 w-36 h-12 p-4 ml-3 rounded-md "
              ></input>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={async () => {
                    await sell();
                  }}
                  className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer text-red-700  justify-center rounded-lg h-11"
                >
                  Sell
                </button>
                <button
                  onClick={async () => {
                    await buy();
                  }}
                  className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer text-green-700 justify-center rounded-lg h-11"
                >
                  buy
                </button>
              </div>
            </div>
            <div className="mr-2 rounded-lg bg-slate-800 p-1.5 gap-2 flex flex-col text-white w-72">
              <label className="text-sm ">Amount</label>
              <input
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                defaultValue="0"
                className="bg-slate-700 border border-slate-500 w-36 h-12 p-4 ml-3 rounded-md "
              ></input>
              <button
                onClick={async () => {
                  await onRamp();
                }}
                className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer  justify-center rounded-lg h-11 w-full text-center"
              >
                add Money
              </button>
            </div>
          </div>
          <div className="mt-20 mr-2 rounded-lg bg-slate-800 p-1.5  flex flex-col text-white w-72 gap-3">
            <div className="flex justify-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 hover:cursor-pointer justify-end "
                onClick={async () => {
                  const res: any = await axios.post(
                    "http://localhost:3000/api/v1/getUsersBalance",
                    {},
                    {
                      headers: {
                        Authorization: localStorage.getItem("token"),
                      },
                    }
                  );
                  setUsersBalance({
                    inrBalance: res.data.userINRBalance,
                    stockBalance: res.data.userStockBalance,
                  });
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </div>
            <label className="text-xl text-center">Balance</label>
            {usersBalance &&
              UsersBalance(
                usersBalance.inrBalance,
                usersBalance.stockBalance,
                searchParams.get("market") || ""
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
