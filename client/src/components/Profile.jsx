import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    Home_no: "",
    street_name: "",
    district: "",
    state: "",
    nation: "",
  });

  useEffect(() => {
    getProfile();
    getAllProfiles();
  }, []);

  const getProfile = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/get_profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      setFormData(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getAllProfiles = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/get_all_profiles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("All profiles:", res.data);
    } catch (error) {
      console.error("Error fetching all profiles:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post("http://localhost:5000/save_profile", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Profile saved successfully");
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  return (
    <div>
      <NavBar highlight={"profile"} />
      <div className="profile-container">
        <h1>Welcome, {user && user.username}!</h1>
        <h3>Profile Details</h3>
        <h4>
          Please update your profile details. This information will be used for
          shipping purposes.
        </h4>
        {user ? (
          <div className="profile-card">
            <form onSubmit={handleSubmit} className="pform">
              <div>
                <h3>Personal Details</h3>
                <div className="profile-content">
                  <p>
                    <label>Username:</label>
                    <input
                      type="text"
                      name="username"
                      className="profile-input"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      className="profile-input"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>Phone number:</label>
                    <input
                      type="text"
                      name="phone_number"
                      className="profile-input"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                    />
                  </p>
                </div>
              </div>
              <div>
                <h3>Address Details</h3>
                <div className="profile-content">
                  <p>
                    <label>Home no:</label>
                    <input
                      type="text"
                      name="Home_no"
                      className="profile-input"
                      value={formData.Home_no}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>Street Name:</label>
                    <input
                      type="text"
                      name="street_name"
                      className="profile-input"
                      value={formData.street_name}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>District:</label>
                    <input
                      type="text"
                      name="district"
                      className="profile-input"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>State:</label>
                    <input
                      type="text"
                      name="state"
                      className="profile-input"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>Nationality:</label>
                    <input
                      type="text"
                      name="nation"
                      className="profile-input"
                      value={formData.nation}
                      onChange={handleChange}
                      required
                    />
                  </p>
                </div>
              </div>
              <div className="profile-button">
                <button type="submit" className="sbutton margin">
                  Save Details
                </button>
              </div>
            </form>
          </div>
        ) : (
          <p>No profile found for the user. Please create a profile.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
