import { useMemo, useState } from "react";
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

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "",
        width: "0%",
        level: "",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak password",
        width: "25%",
        level: "weak",
      };
    }

    if (score <= 3) {
      return {
        label: "Medium password",
        width: "60%",
        level: "medium",
      };
    }

    return {
      label: "Strong password",
      width: "100%",
      level: "strong",
    };
  }, [password]);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
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

    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          name: cleanName,
          email: cleanEmail,
          password,
        },
      );

      console.log(response.data);

      alert("Registration Successful! Please login.");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptedTerms(false);

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
      {/* Background */}
      <div className="register-background">
        <div className="register-background-overlay"></div>

        <div className="register-circle register-circle-one"></div>
        <div className="register-circle register-circle-two"></div>
        <div className="register-circle register-circle-three"></div>
      </div>

      {/* Header */}
      <header className="register-header">
        <Link to="/hotels" className="register-brand">
          <div className="register-brand-icon">H</div>

          <div className="register-brand-text">
            Hotel<span>Booking</span>
          </div>
        </Link>

        <Link to="/hotels" className="back-home">
          <span className="back-arrow">←</span>
          Back to Home
        </Link>
      </header>

      {/* Main */}
      <main className="register-main">
        <div className="register-container">
          {/* LEFT SIDE */}
          <section className="register-showcase">
            <div className="showcase-overlay"></div>

            <div className="showcase-content">
              <div className="showcase-badge">
                <span>✦</span>
                HOTELBOOKING
              </div>

              <h1>
                Your next
                <br />
                <span>beautiful stay</span>
                <br />
                starts here.
              </h1>

              <p className="showcase-description">
                Create your account and discover comfortable stays, beautiful
                destinations, and memorable hotel experiences.
              </p>

              <div className="showcase-features">
                <div className="showcase-feature">
                  <div className="feature-icon">✓</div>

                  <div>
                    <strong>Discover great hotels</strong>
                    <span>Explore stays made for you</span>
                  </div>
                </div>

                <div className="showcase-feature">
                  <div className="feature-icon">◆</div>

                  <div>
                    <strong>Easy booking</strong>
                    <span>Plan your next trip with ease</span>
                  </div>
                </div>

                <div className="showcase-feature">
                  <div className="feature-icon">★</div>

                  <div>
                    <strong>Save your favorites</strong>
                    <span>Keep your favorite hotels close</span>
                  </div>
                </div>
              </div>

              <div className="showcase-bottom">
                <span className="showcase-line"></span>
                <span>Stay somewhere unforgettable.</span>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="register-card">
            {/* Card heading */}
            <div className="register-card-header">
              <div className="register-card-logo">H</div>

              <div>
                <span className="register-eyebrow">
                  WELCOME TO HOTELBOOKING
                </span>

                <h2>Create your account</h2>

                <p>Join us and start discovering your perfect stay.</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="register-error">
                <div className="register-error-icon">!</div>

                <div>
                  <strong>Something needs your attention</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Full Name */}
              <div className="register-form-group">
                <label htmlFor="name">
                  Full Name
                  <span>*</span>
                </label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">♙</span>

                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="register-form-group">
                <label htmlFor="email">
                  Email Address
                  <span>*</span>
                </label>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="register-form-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                    <span>*</span>
                  </label>

                  <small>Minimum 6 characters</small>
                </div>

                <div className="register-input-wrapper">
                  <span className="register-input-icon">▣</span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>

                {/* Password strength */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-top">
                      <span>Password strength</span>

                      <strong className={passwordStrength.level}>
                        {passwordStrength.label}
                      </strong>
                    </div>

                    <div className="strength-bar">
                      <div
                        className={`strength-progress ${passwordStrength.level}`}
                        style={{
                          width: passwordStrength.width,
                        }}
                      ></div>
                    </div>

                    <div className="password-requirements">
                      <span className={password.length >= 6 ? "valid" : ""}>
                        {password.length >= 6 ? "✓" : "○"} 6+ characters
                      </span>

                      <span className={/[A-Z]/.test(password) ? "valid" : ""}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase
                      </span>

                      <span className={/[0-9]/.test(password) ? "valid" : ""}>
                        {/[0-9]/.test(password) ? "✓" : "○"} Number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="register-form-group">
                <label htmlFor="confirmPassword">
                  Confirm Password
                  <span>*</span>
                </label>

                <div
                  className={`register-input-wrapper ${
                    confirmPassword
                      ? passwordsMatch
                        ? "input-success"
                        : "input-danger"
                      : ""
                  }`}
                >
                  <span className="register-input-icon">◇</span>

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "◉" : "◌"}
                  </button>

                  {confirmPassword && (
                    <span
                      className={`password-match-icon ${
                        passwordsMatch ? "match" : "no-match"
                      }`}
                    >
                      {passwordsMatch ? "✓" : "!"}
                    </span>
                  )}
                </div>

                {confirmPassword && (
                  <div
                    className={`match-message ${
                      passwordsMatch ? "match" : "no-match"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="register-terms">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={loading}
                  />

                  <span className="custom-checkbox"></span>

                  <span className="terms-text">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="terms-link"
                      onClick={() =>
                        alert("Terms & Conditions will be available soon.")
                      }
                    >
                      Terms & Conditions
                    </button>{" "}
                    and Privacy Policy.
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
                    <span className="register-spinner"></span>
                    Creating your account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="register-button-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <div className="register-login">
              <span>Already have an account?</span>

              <Link to="/login">Sign in</Link>
            </div>

            {/* Security */}
            <div className="register-security">
              <span className="security-icon">♙</span>

              <div>
                <strong>Your information is protected</strong>
                <span>We use secure technology to keep your account safe.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="register-footer">
        <span>© 2026 HotelBooking</span>

        <span className="footer-dot">•</span>

        <span>Find your perfect stay</span>
      </footer>
    </div>
  );
}

export default Register;
