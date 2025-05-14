import axios from "axios";
import { useEffect, useState } from "react";

export const useGetDepth = (market: string) => {
  const [orderBook, setOrderBook] = useState<any>();
  async function FetchingOrderBook() {
    const res = await axios.get(`http://localhost:3000/depth?market=${market}`);
    setOrderBook(res.data);
  }
  useEffect(() => {
    FetchingOrderBook();
  }, []);
  return orderBook;
};

export const useGetUsersBalance = () => {
  const [balance, setBalance] = useState<any>();
  async function FetchingBalance() {
    const res: any = await axios.post(
      "http://localhost:3000/api/v1/getUsersBalance",
      {},
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    console.log(res.data.userINRBalance)
    setBalance({
      inrBalance: res.data.userINRBalance,
      stockBalance: res.data.userStockBalance,
    });
  }
  useEffect(() => {
    FetchingBalance();
  }, []);
  console.log(balance);
  return balance;
};
