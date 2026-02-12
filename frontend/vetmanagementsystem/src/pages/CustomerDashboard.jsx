import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../Navbar";
import OverviewCard from "../OverviewCard";

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    appointments: 0,
    receipts: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const appointmentsRes = await API.get("/appointments/");
        const receiptsRes = await API.get("/receipts/");
        setStats({
          appointments: appointmentsRes.data.length,
          receipts: receiptsRes.data.length,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
      backgroundSize: "cover",
      padding: "20px"
    }}>
      <Navbar role="customer" />
      <h1 style={{textAlign:"center", color:"#111"}}>Customer Dashboard</h1>
      <div style={{display:"flex", gap:"20px", flexWrap:"wrap", marginTop:"20px"}}>
        <OverviewCard title="Appointments" value={stats.appointments} />
        <OverviewCard title="Receipts" value={stats.receipts} />
      </div>
    </div>
  );
}
