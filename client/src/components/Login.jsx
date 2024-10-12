import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/full_logo.png";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        { username, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        localStorage.setItem("token", response.data.token);
        console.log(
          "Token is stored in Local Storage",
          localStorage.getItem("token")
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/signup");
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" className="logo" />

        <h1>Login</h1>
        <label for="User">Username:</label>
        <input
          type="text"
          id="User"
          className="User mb-30"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br />
        <label for="password">Password:</label>
        <input
          type={showPassword ? "text" : "password"}
          className="password mb-30"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          className="mb-30"
        />
        <label for="showPassword"> show password </label>
        <br />
        <button type="submit" className="sbutton">
          Submit
        </button>
        <button
          type="button"
          className="sbutton"
          onClick={() => navigate("/signup")}
        >
          For new user
        </button>
      </form>
    </div>
  );
}

export default Login;
