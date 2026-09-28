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

    const cleanEmail = email.trim();

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
      console.log("LOGIN SUCCESS");
      console.log("STATUS:", response.status);
      console.log("RESPONSE:", response.data);
      console.log("=================================");

      const data = response.data;

      // Support different backend response structures
      const user =
        data.user ||
        data.data?.user ||
        data.account ||
        data.data?.account ||
        null;

      const token =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token ||
        null;

      console.log("USER:", user);
      console.log("TOKEN:", token);

      // If backend did not return a token
      if (!token) {
        console.error("LOGIN ERROR: No token returned.");

        setError(
          "Login succeeded, but the server did not return an authentication token.",
        );

        return;
      }

      // If backend did not return user
      if (!user) {
        console.error("LOGIN ERROR: No user returned.");

        setError(
          "Login succeeded, but the server did not return user information.",
        );

        return;
      }

      /*
       * Save authentication information
       */

      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Also support token key if other parts of the application use it
      localStorage.setItem("token", token);

      // Update AuthContext
      login(user, token);

      console.log("=================================");
      console.log("AUTHENTICATION SAVED");
      console.log("User:", user);
      console.log("Saved accessToken:", localStorage.getItem("accessToken"));
      console.log("Role:", user.role);
      console.log("=================================");

      setEmail("");
      setPassword("");

      alert("Login Successful");

      /*
       * Redirect based on role
       */

      if (user.role === "hoteladmin") {
        navigate("/admin");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "superadmin") {
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
      console.error("Request data:", error.config?.data);

      if (error.response) {
        if (error.response.status === 401) {
          setError(
            error.response.data?.message || "Invalid email or password.",
          );
        } else if (error.response.status === 400) {
          setError(
            error.response.data?.message || "Invalid login information.",
          );
        } else if (error.response.status === 404) {
          setError(
            "Login endpoint was not found. Please check the backend server.",
          );
        } else if (error.response.status >= 500) {
          setError("Server error. Please check your backend server.");
        } else {
          setError(
            error.response.data?.message ||
              "Unable to login. Please try again.",
          );
        }
      } else if (error.request) {
        setError(
          "Cannot connect to the server. Make sure the backend is running on port 5000.",
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

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

      <main className="login-main">
        <div className="login-card">
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
                  onChange={(e) => setEmail(e.target.value)}
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

          <div className="login-divider">
            <span>New to HotelBooking?</span>
          </div>

          <p className="register-text">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          <div className="secure-login">
            <span>🔐</span>

            <span>Your information is securely protected</span>
          </div>
        </div>
      </main>

      <footer className="login-footer">
        <p>© 2026 HotelBooking. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
