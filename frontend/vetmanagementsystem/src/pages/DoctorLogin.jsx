import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function DoctorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api-token-auth/",
        {
          username: username,
          password: password,
        }
      );

      // save token
      localStorage.setItem("token", response.data.token);

      // go to admin dashboard
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="center">
      <div className="glass">
        <h2>Doctor Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default DoctorLogin;
