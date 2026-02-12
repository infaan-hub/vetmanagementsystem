import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import OverviewCard from "../components/OverviewCard";

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    visits: 0,
    treatments: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const patientsRes = await API.get("/patients/");
        const visitsRes = await API.get("/visits/");
        const treatmentsRes = await API.get("/treatmentplans/");
        setStats({
          patients: patientsRes.data.length,
          visits: visitsRes.data.length,
          treatments: treatmentsRes.data.length,
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
      <Navbar role="doctor" />
      <h1 style={{textAlign:"center", color:"#111"}}>Doctor Dashboard</h1>
      <div style={{display:"flex", gap:"20px", flexWrap:"wrap", marginTop:"20px"}}>
        <OverviewCard title="Patients" value={stats.patients} />
        <OverviewCard title="Visits" value={stats.visits} />
        <OverviewCard title="Treatments" value={stats.treatments} />
      </div>
    </div>
  );
}
