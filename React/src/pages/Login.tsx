import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { callApi } from "../utils/callApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const data = await callApi<{ access_token: string; name: string }>(
        "/auth/login",
        "POST",
        { email, password }
      );

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.name);
      console.log("Shreays is the GOAT ", data.access_token);
      navigate("/home");
    } catch (err: any) {
      alert("Login failed: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const name = result.user.displayName;

      if (!email || !name) {
        throw new Error("Missing Google user info.");
      }

      const data = await callApi<{ access_token: string; name: string }>(
        "/auth/google-login",
        "POST",
        { email, name }
      );

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.name);
      console.log("Google login successful. Navigating to home.", data.access_token);
      navigate("/home");
    } catch (err: any) {
      alert("Google login failed: " + err.message);
    }
  };

  return (
    <div className="col-md-6 mx-auto">
      <h2 className="mb-4">Login</h2>

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

      <button className="btn btn-primary w-100 mb-2" onClick={handleLogin}>
        Login
      </button>

      <button className="btn btn-outline-danger w-100 mb-3" onClick={handleGoogleLogin}>
        Sign in with Google
      </button>

      <p className="text-center">
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
