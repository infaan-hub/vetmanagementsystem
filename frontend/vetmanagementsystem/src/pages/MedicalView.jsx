import { useEffect, useState } from "react";
import api from "../api/api";

export default function MedicalView() {
  const [notes, setNotes] = useState(['garib']);
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    api.get("medical-notes/").then(res=>setNotes(res.data));
    api.get("medications/").then(res=>setMeds(res.data));
  }, []);

  return (
        <h1>{notes}</h1>
  );
}
