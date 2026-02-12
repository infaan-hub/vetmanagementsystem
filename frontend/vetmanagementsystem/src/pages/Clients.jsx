import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

export default function Clients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/clients/");
        setClients(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="doctor" />
      <h1>Clients</h1>
      <ul>
        {clients.map(c => <li key={c.id}>{c.full_name} ({c.username})</li>)}
      </ul>
    </div>
  );
}
