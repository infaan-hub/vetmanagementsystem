import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import VisitCard from "../components/VisitCard";

export default function Visits() {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/visits/");
        setVisits(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="doctor" />
      <h1>Visits</h1>
      <div style={{marginTop:"20px"}}>
        {visits.map((v) => <VisitCard key={v.id} visit={v} />)}
      </div>
    </div>
  );
}
