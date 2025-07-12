// 📁 frontend/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import '../styles/AuthForms.css'; // <--- IMPORT THE NEW CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(formData);
      const user = res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id);
      console.log("✅ Login successful");
      // Use replace: true to prevent going back to login after successful login
      navigate("/journal", { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="auth-page-container"> {/* New wrapper for background and centering */}
      <div className="auth-card"> {/* New card styling */}
        <h2>Login</h2>
        {error && <p className="auth-error-message">{error}</p>} {/* New error message styling */}
        <form onSubmit={handleSubmit} className="auth-form"> {/* New form styling */}
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="auth-submit-button">Login</button> {/* New button styling */}
        </form>
        <p className="auth-switch-link">Don't have an account? <a href="/register">Register</a></p> {/* New link styling */}
      </div>
    </div>
  );
};

export default Login;