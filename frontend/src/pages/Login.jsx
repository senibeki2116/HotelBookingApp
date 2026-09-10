import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        },
      );

      login(response.data.user, response.data.token);

      setEmail("");
      setPassword("");

      alert("Login Successful");

      navigate("/hotels");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background overlay */}
      <div className="login-overlay"></div>

      {/* Top brand */}
      <header className="login-header">
        <Link to="/hotels" className="login-brand">
          <span className="brand-icon">🏨</span>
          <span>
            Hotel<span>Booking</span>
          </span>
        </Link>

        <Link to="/hotels" className="back-home">
          ← Back to Home
        </Link>
      </header>

      {/* Main content */}
      <main className="login-main">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">🏨</div>
          </div>

          <h1>Welcome Back</h1>

          <p className="login-subtitle">
            Sign in to continue your hotel booking journey
          </p>

          {error && (
            <div className="login-error">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">Password</label>

                <span className="forgot-password">Forgot password?</span>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            {/* Login button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>New to HotelBooking?</span>
          </div>

          {/* Register */}
          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          {/* Security message */}
          <div className="secure-login">
            <span>🔐</span>
            <span>Your information is securely protected</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <p>© 2026 HotelBooking. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
