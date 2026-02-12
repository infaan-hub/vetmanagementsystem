import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import PatientCard from "../components/PatientCard";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/patients/");
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{
      minHeight:"100vh",
      backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
      backgroundSize:"cover",
      padding:"20px"
    }}>
      <Navbar role="doctor" />
      <h1>Patients</h1>
      <div style={{marginTop:"20px"}}>
        {patients.map((p) => <PatientCard key={p.id} patient={p} />)}
      </div>
    </div>
  );
}
