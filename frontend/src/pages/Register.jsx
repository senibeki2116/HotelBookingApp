import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name,
          email,
          password,
        },
      );

      console.log(response.data);

      alert("Registration Successful! Please login.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Background overlay */}
      <div className="register-overlay"></div>

      {/* Header */}
      <header className="register-header">
        <Link to="/hotels" className="register-brand">
          <span className="brand-icon">🏨</span>

          <span>
            Hotel<span>Booking</span>
          </span>
        </Link>

        <Link to="/hotels" className="back-home">
          ← Back to Home
        </Link>
      </header>

      {/* Main */}
      <main className="register-main">
        <div className="register-card">
          {/* Logo */}
          <div className="register-logo">
            <div className="register-logo-icon">🏨</div>
          </div>

          <h1>Create Your Account</h1>

          <p className="register-subtitle">
            Join HotelBooking and start discovering your perfect stay
          </p>

          {/* Error */}
          {error && (
            <div className="register-error">
              <span className="error-icon">!</span>

              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  autoComplete="new-password"
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

              <small className="password-hint">
                Password must contain at least 6 characters
              </small>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <div className="input-wrapper">
                <span className="input-icon">🔐</span>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="terms">
              <label>
                <input type="checkbox" required />

                <span>
                  I agree to the{" "}
                  <span className="terms-link">Terms & Conditions</span>
                </span>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <div className="login-divider">
            <span>Already a member?</span>
          </div>

          <p className="login-text">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

          {/* Security */}
          <div className="secure-register">
            <span>🔐</span>

            <span>Your information is securely protected</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="register-footer">
        <p>© 2026 HotelBooking. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Register;
