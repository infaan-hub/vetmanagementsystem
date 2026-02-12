import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../Navbar";

export default function Medications() {
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/medications/");
        setMedications(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="doctor" />
      <h1>Medications</h1>
      <ul>
        {medications.map(m => <li key={m.id}>{m.name} - {m.dosage}</li>)}
      </ul>
    </div>
  );
}
