import axios from "axios";
import { use, useEffect, useState } from "react";
import { useGetDepth } from "./utils";
import { useSearchParams } from "react-router-dom";

export const Homepage = () => {
  const [orderBook, setOrderBook] = useState<any>();
  const [price, setPrice] = useState("0");
  const [quantity, setQuantity] = useState("0");
  const [amount,setAmount]=useState("0")
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [searchParams, setSearchParams] = useSearchParams();

  const data = useGetDepth(searchParams.get("market") || "");
  const socket = new WebSocket("ws://localhost:8080");
  socket.onmessage = function (message) {
    setOrderBook(JSON.parse(message.data));
  };
  useEffect(() => {
    setOrderBook(data);
  }, [data]);
  async function onRamp(){
     const response: any = await axios.post(
      `http://localhost:3000/onRamp`,
      {
       amount
        },
        {
         headers: {
            Authorization: localStorage.getItem("token"),
          },
      }
     )
     alert(response.data.message)
  }
  async function buy(){
if(orderType=="limit"&&Number(price)!=0&&Number(quantity)!=0){
      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          price: Number(price),
          quantity: Number(quantity),
          type: "ask",
          orderType:orderType
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      console.log(response.data.message);
      alert(response.data.message);
    }else{
            if(Number(quantity)!=0){
      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          quantity: Number(quantity),
          type: "ask",
          orderType:orderType
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
if(orderType=="limit"&&Number(price)!=0&&Number(quantity)!=0){

      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          price: Number(price),
          quantity: Number(quantity),
          type: "bid",
          orderType:orderType
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      alert(response.data.message);

    }else{
      if(Number(quantity)!=0){
      const response: any = await axios.post(
        `http://localhost:3000/api/v1/order?market=${searchParams.get("market")}`,
        {
          quantity: Number(quantity),
          type: "bid",
          orderType:orderType
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
                {orderBook?.asks
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((value: any, index: any) => {
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
                {orderBook?.bids
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((value: any, index: any) => {
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
                await  sell()
                }}
                className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer text-red-700  justify-center rounded-lg h-11"
              >
                Sell
              </button>
              <button
                onClick={async () => {
                 await buy()
                }}
                className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer text-green-700 justify-center rounded-lg h-11"
              >
                buy
              </button>
              <div className="flex flex-col gap-2 mt-2">
           <label className="text-sm ">Amount</label>
            <input
              onChange={(e) => {
                setAmount(e.target.value)
              }}
              defaultValue="0"
              className="bg-slate-700 border border-slate-500 w-36 h-12 p-4 ml-3 rounded-md "
            ></input>
             <button
                onClick={async () => {
               await onRamp()
                }}
                className="bg-slate-700 hover:bg-slate-500 hover:cursor-pointer text-white justify-center rounded-lg h-11"
              >add Money</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
