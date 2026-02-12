import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/receipts/");
        setReceipts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="customer" />
      <h1>Receipts</h1>
      <ul>
        {receipts.map(r => <li key={r.id}>{r.amount} - {r.status}</li>)}
      </ul>
    </div>
  );
}
