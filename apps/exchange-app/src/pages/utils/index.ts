import axios from "axios";
import { useEffect, useState } from "react";

export const useGetDepth=()=>{
  const [orderBook, setOrderBook] = useState<any>();
  async function FetchingOrderBook() {
     const res=await axios.get(`http://localhost:3000/api/v1/depth`)
     setOrderBook(res.data)
      }
  useEffect(() => {
    FetchingOrderBook();
  }, []);
  return orderBook
  
}