import api from "../api/api";

export default function AdminDashboard() {
  const create = (url,data)=>api.post(url,data);

  return (
    <div className="grid">
      <button onClick={()=>create("allergies/",{description:"Test"})}>Allergy</button>
      <button onClick={()=>create("visits/",{patient:1})}>Visit</button>
      <button onClick={()=>create("medical-notes/",{note:"OK"})}>Medical Note</button>
      <button onClick={()=>create("medications/",{medication_name:"Antibiotic"})}>Medication</button>
      <button onClick={()=>create("documents/",{})}>Document</button>
      <button onClick={()=>create("treatments/",{})}>Treatment</button>
    </div>
  );
}
