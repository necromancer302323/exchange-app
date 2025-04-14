import axios from "axios";
import { useEffect, useState } from "react";

export const useOrderBook=()=>{
  const [orderBook, setOrderBook] = useState<any>();
  async function FetchingOrderBook() {
     await axios.get(`http://localhost:3000/api/v1/depth`).then((res)=>{
        setOrderBook(res.data);     
    })
   
  }
  useEffect(() => {
    FetchingOrderBook();
  }, []);
  return orderBook
  
}