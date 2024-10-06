import React, { useState, useEffect } from "react";
import { auth } from "./firebase_config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./login.css";
import logo from "./assets/images/mess_logo.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isObscured, setIsObscured] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessage("No such mail id found.");
          break;
        case "auth/wrong-password":
          setErrorMessage("Incorrect password.");
          break;
        case "auth/invalid-email":
          setErrorMessage("Invalid email format.");
          break;
        default:
          setErrorMessage("Login failed. Please try again.");}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000); 
      return () => clearTimeout(timer); 
    }
  }, [errorMessage]);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src={logo} alt="Mess Logo" className="logo" />
        <h1>Welcome to Sanathana Mess</h1>
        <div className="password-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type={isObscured ? "password" : "text"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setIsObscured(!isObscured)}
          >
            {isObscured ? "Show" : "Hide"}
          </button>
        </div>
        <button type="submit" className="submit-button">
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        {errorMessage && (
          <div className="error-modal">
            <p>{errorMessage}</p>
          </div>
        )}
        <div className="signup-prompt">
          <span>Don't have an account? </span>
          <a href="/register" className="signup-link">
            Sign Up
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;
