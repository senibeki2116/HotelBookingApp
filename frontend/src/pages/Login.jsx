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

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      console.log("=================================");
      console.log("STARTING LOGIN");
      console.log("Email:", cleanEmail);
      console.log("=================================");

      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email: cleanEmail,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("=================================");
      console.log("LOGIN RESPONSE");
      console.log("Status:", response.status);
      console.log("Data:", response.data);
      console.log("=================================");

      const data = response.data || {};

      // ========================================
      // GET USER FROM BACKEND RESPONSE
      // ========================================

      const user =
        data.user ||
        data.data?.user ||
        data.account ||
        data.data?.account ||
        null;

      // ========================================
      // GET TOKEN FROM BACKEND RESPONSE
      // ========================================

      const token =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token ||
        null;

      console.log("User returned:", user);
      console.log("Token returned:", token ? "YES" : "NO");

      // ========================================
      // CHECK TOKEN
      // ========================================

      if (!token) {
        console.error("LOGIN ERROR: No token returned.");

        setError(
          "Login succeeded, but the server did not return an authentication token.",
        );

        return;
      }

      // ========================================
      // CHECK USER
      // ========================================

      if (!user) {
        console.error("LOGIN ERROR: No user returned.");

        setError(
          "Login succeeded, but the server did not return user information.",
        );

        return;
      }

      // ========================================
      // CLEAN TOKEN
      // ========================================

      const cleanToken = String(token)
        .replace(/^Bearer\s+/i, "")
        .trim();

      if (!cleanToken) {
        console.error("LOGIN ERROR: Token is empty.");

        setError("Authentication token is invalid.");

        return;
      }

      // ========================================
      // SAVE AUTHENTICATION
      // ========================================

      localStorage.setItem("accessToken", cleanToken);
      localStorage.setItem("token", cleanToken);
      localStorage.setItem("user", JSON.stringify(user));

      // ========================================
      // VERIFY STORAGE
      // ========================================

      const savedToken = localStorage.getItem("accessToken");

      console.log("=================================");
      console.log("AUTHENTICATION SAVED");
      console.log("User:", user);
      console.log("Role:", user.role);
      console.log("Access token saved:", savedToken ? "YES" : "NO");
      console.log("=================================");

      if (!savedToken) {
        setError("Unable to save your login session.");
        return;
      }

      // ========================================
      // UPDATE AUTH CONTEXT
      // ========================================

      login(user, cleanToken);

      // ========================================
      // CLEAR FORM
      // ========================================

      setEmail("");
      setPassword("");

      alert("Login Successful");

      // ========================================
      // REDIRECT BASED ON ROLE
      // ========================================

      const role = String(user.role || "")
        .trim()
        .toLowerCase();

      if (role === "admin" || role === "hoteladmin" || role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/hotels");
      }
    } catch (error) {
      console.error("=================================");
      console.error("LOGIN ERROR");
      console.error("=================================");

      console.error("Error:", error);
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      console.error("Request URL:", error.config?.url);
      console.error("Request method:", error.config?.method);

      // ========================================
      // BACKEND RESPONSE ERROR
      // ========================================

      if (error.response) {
        const status = error.response.status;

        const backendMessage =
          error.response.data?.message || error.response.data?.error || "";

        if (status === 401) {
          setError(backendMessage || "Invalid email or password.");
        } else if (status === 400) {
          setError(backendMessage || "Invalid login information.");
        } else if (status === 403) {
          setError(backendMessage || "You do not have permission to login.");
        } else if (status === 404) {
          setError(
            "Login endpoint was not found. Please check the backend server.",
          );
        } else if (status >= 500) {
          setError(
            backendMessage || "Server error. Please check your backend server.",
          );
        } else {
          setError(backendMessage || "Unable to login. Please try again.");
        }

        return;
      }

      // ========================================
      // SERVER CONNECTION ERROR
      // ========================================

      if (error.request) {
        setError(
          "Cannot connect to the server. Make sure the backend is running on port 5000.",
        );

        return;
      }

      // ========================================
      // UNKNOWN ERROR
      // ========================================

      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      {/* HEADER */}
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

      {/* MAIN */}
      <main className="login-main">
        <div className="login-card">
          {/* LOGO */}
          <div className="login-logo">
            <div className="login-logo-icon">🏨</div>
          </div>

          <h1>Welcome Back</h1>

          <p className="login-subtitle">
            Sign in to continue your hotel booking journey
          </p>

          {/* ERROR */}
          {error && (
            <div className="login-error">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* EMAIL */}
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
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}
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
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
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

            {/* OPTIONS */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" disabled={loading} />

                <span>Remember me</span>
              </label>
            </div>

            {/* LOGIN BUTTON */}
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

          {/* DIVIDER */}
          <div className="login-divider">
            <span>New to HotelBooking?</span>
          </div>

          {/* REGISTER */}
          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          {/* SECURITY */}
          <div className="secure-login">
            <span>🔐</span>

            <span>Your information is securely protected</span>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="login-footer">
        <p>© 2026 HotelBooking. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
