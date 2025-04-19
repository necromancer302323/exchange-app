import axios from "axios";
import { useEffect, useState } from "react";

export const useGetDepth=(market:string)=>{
  const [orderBook, setOrderBook] = useState<any>();
  async function FetchingOrderBook() {
     const res=await axios.get(`http://localhost:3000/api/v1/depth?market=${market}`)
     setOrderBook(res.data)
      }
  useEffect(() => {
    FetchingOrderBook();
  }, []);
  return orderBook
  
}