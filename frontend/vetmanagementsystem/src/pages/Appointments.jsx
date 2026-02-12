import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await API.get("/appointments/");
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{minHeight:"100vh", backgroundImage:"url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')", backgroundSize:"cover", padding:"20px"}}>
      <Navbar role="customer" />
      <h1>Appointments</h1>
      <ul>
        {appointments.map(a => <li key={a.id}>{a.patient_name} - {new Date(a.date).toLocaleDateString()}</li>)}
      </ul>
    </div>
  );
}
