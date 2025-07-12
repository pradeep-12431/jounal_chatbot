// 📁 frontend/src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import '../styles/AuthForms.css'; // <--- IMPORT THE NEW CSS

const Register = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      // Navigate to login after successful registration for them to log in
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <div className="auth-page-container"> {/* New wrapper for background and centering */}
      <div className="auth-card"> {/* New card styling */}
        <h2>Register</h2>
        {error && <p className="auth-error-message">{error}</p>} {/* New error message styling */}
        <form onSubmit={handleSubmit} className="auth-form"> {/* New form styling */}
          <input name="username" placeholder="Username" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="auth-submit-button">Register</button> {/* New button styling */}
        </form>
        <p className="auth-switch-link">Already have an account? <a href="/login">Login</a></p> {/* New link styling */}
      </div>
    </div>
  );
};

export default Register;