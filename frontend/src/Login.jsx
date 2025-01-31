import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://intern-end-szcr.onrender.com/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/flashcards");
    } catch (err) {
      console.error("Login Error:", err.response?.data?.message || err.message);
      alert(`⚠️ ${err.response?.data?.message || "Login failed!"}`); // Highlight error in alert
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
