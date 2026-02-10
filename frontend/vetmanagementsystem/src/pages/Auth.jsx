import { useState } from "react";
import { API, setAuthToken } from "../api/api";
import GlassCard from "../components/GlassCard";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    const url = isRegister ? "register/" : "login/";
    const res = await API.post(url, form);
    localStorage.setItem("token", res.data.token);
    setAuthToken(res.data.token);
    alert("Success!");
  };

  return (
    <div className="center">
      <GlassCard title={isRegister ? "Register" : "Login"}>
        <input
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        {isRegister && (
          <>
            <input
              placeholder="Full Name"
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
            <input
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={submit}>
          {isRegister ? "Register" : "Login"}
        </button>

        <small
          style={{ cursor: "pointer" }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have an account?" : "Create account"}
        </small>
      </GlassCard>
    </div>
  );
}
