import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/full_logo.png";
import axios from "axios";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        alert("Passwords don't match");
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/signup",
        { username, password, confirmPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        console.log("Signup successful:", response.data);
        localStorage.setItem("token", response.data.token);
        console.log(
          "Token is stored in Local Storage",
          localStorage.getItem("token")
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="signup">
      <form onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" className="logo" />

        <h1>Signup</h1>
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
          type="text"
          className="password mb-30"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <label for="password">Confirm Password:</label>
        <input
          type="password"
          className="password mb-30"
          id="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" className="sbutton">
          Submit
        </button>
        <button
          type="button"
          className="sbutton"
          onClick={() => navigate("/login")}
        >
          Existing User
        </button>
      </form>
    </div>
  );
}

export default Signup;
