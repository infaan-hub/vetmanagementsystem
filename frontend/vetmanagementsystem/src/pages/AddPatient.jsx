import { useState, useEffect } from "react";
import { getClients, createPatient } from "../api/api";

export default function AddPatient() {
  const [patientId, setPatientId] = useState("");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [color, setColor] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [photo, setPhoto] = useState(null);
  const [client, setClient] = useState("");

  const [clients, setClients] = useState([]);

  /* =========================
     FETCH CLIENTS
  ========================= */
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients", err);
      }
    };
    fetchClients();
  }, []);

  /* =========================
     SUBMIT PATIENT
  ========================= */
  const submit = async (e) => {
    e.preventDefault();

    const patientData = {
      patient_id: patientId,
      name,
      species,
      breed,
      gender,
      color,
      date_of_birth: dateOfBirth,
      weight_kg: weightKg ? parseFloat(weightKg) : null,
      photo,
      client,
    };

    try {
      await createPatient(patientData);
      alert("Patient added successfully ✅");

      // reset form
      setPatientId("");
      setName("");
      setSpecies("");
      setBreed("");
      setGender("");
      setColor("");
      setDateOfBirth("");
      setWeightKg("");
      setPhoto(null);
      setClient("");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to add patient ❌");
    }
  };

  return (
    <form onSubmit={submit} className="glass">
      <input
        type="text"
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Species"
        value={species}
        onChange={(e) => setSpecies(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Breed"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
      />

      <select value={gender} onChange={(e) => setGender(e.target.value)} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <input
        type="text"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <input
        type="date"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
      />

      <input
        type="number"
        placeholder="Weight (kg)"
        step="0.01"
        value={weightKg}
        onChange={(e) => setWeightKg(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <select value={client} onChange={(e) => setClient(e.target.value)} required>
        <option value="">Select Client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name}
          </option>
        ))}
      </select>

      <button type="submit">Add Patient</button>
    </form>
  );
}