import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    // Add backend signup later
    navigate("/"); // go back to login
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Sign up to get started</p>

        <form onSubmit={handleSignup} className="login-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <button type="submit" className="login-btn">
            Create Account
          </button>
        </form>

        <p className="login-footer">
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
