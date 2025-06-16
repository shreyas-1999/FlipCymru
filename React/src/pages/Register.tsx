import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../utils/callApi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const data = await callApi<{ access_token: string; name: string }>(
        "/auth/register",
        "POST",
        { name, email, password }
      );

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.name);
      navigate("/");
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="col-md-6 mx-auto">
      <h2 className="mb-4">Register</h2>
      <input
        className="form-control mb-3"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="form-control mb-3"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="form-control mb-3"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn btn-success w-100" onClick={handleRegister}>
        Register
      </button>
      <p className="mt-3 text-center">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}
