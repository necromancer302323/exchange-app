import axios from "axios";
import { useEffect, useState } from "react";
import { useGetDepth } from "./utils";
import { useSearchParams } from "react-router-dom";

export const Homepage = () => {
  const [orderBook, setOrderBook] = useState<any>();
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const data = useGetDepth(searchParams.get("market") || "");
  const socket = new WebSocket("ws://localhost:8080");
  socket.onmessage = function (message) {
    console.log(message.data);
    setOrderBook(JSON.parse(message.data));
  };
  useEffect(() => {
    setOrderBook(data);
  }, [data]);
  return (
    <div>
      <div className="w-full h-full grid grid-cols-2">
        <div></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <table className="w-full mt-20  bg-slate-800 rounded-md p-1.5 mr-14 ">
              <thead>
                <tr className="text-white">
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {orderBook?.asks.slice(0, 5).map((value: any, index: any) => {
                  return (
                    <tr key={index} className=" text-red-400 text-center ">
                      <td>{value.price}</td>
                      <td>{value.quantity}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className="text-3xl text-green-400 text-center">
                    248.26
                  </td>
                </tr>
                {orderBook?.bids.slice(0, 5).map((value: any, index: any) => {
                  return (
                    <tr key={index} className=" text-green-400 text-center">
                      <td>{value.price}</td>
                      <td>{value.quantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-20 mr-2 rounded-lg bg-slate-800 p-1.5 gap-2 flex flex-col text-white w-72">
            <label className="text-sm">Price</label>
            <input
              onChange={(e) => {
                setPrice(e.target.value);
              }}
              defaultValue="127.38"
              className="bg-slate-700 border border-slate-500 w-36 h-12 p-4 ml-3 rounded-md"
            ></input>
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
                  await axios.post(
                    `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`, {
                      price: Number(price),
                      quantity: Number(quantity),
                      type: "ask",
                    },{
                      headers:{
                        Authorization: localStorage.getItem("token"),
                      },
                    }
                  );
                }}
                className="bg-slate-800 text-red-700  justify-center rounded-lg h-11"
              >
                Sell
              </button>
              <button
                onClick={async () => {
               await axios.post(
                `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
                    {
                      headers:{
                        Authorization: localStorage.getItem("token"),
                      },
                      price: Number(price),
                      quantity: Number(quantity),
                      type: "bid",
                    }
                  );
                }}
                className="bg-slate-700 text-green-700 justify-center rounded-lg h-11"
              >
                buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
