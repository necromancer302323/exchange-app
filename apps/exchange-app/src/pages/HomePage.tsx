import axios from "axios";
import { useEffect, useState } from "react"
import { useOrderBook } from "../hooks";

export const Homepage=()=>{
    const [orderBook,setOrderBook]=useState<any>()
    const data=useOrderBook()
    const socket = new WebSocket("ws://localhost:8080");
    socket.onmessage= function (message){
      console.log(message.data)
      setOrderBook(JSON.parse(message.data))
    }
    useEffect(()=>{
      setOrderBook(data)
    },[data])
    return <div>
         <button onClick={async()=>{
      await axios.post("http://localhost:3000/api/v1/order",{
        message:"hello"
      })
    }}>
      click me !
    </button>
    <div className="mt-4">
    {JSON.stringify(orderBook)}
    </div>
       </div>
}