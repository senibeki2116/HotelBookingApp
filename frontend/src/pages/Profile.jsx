import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userName = user?.name || "Guest User";
  const userEmail = user?.email || "No email available";
  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <div className="profile-dashboard">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="profile-brand">
          <div className="brand-logo">H</div>
          <h2>
            Hotel<span>Booking</span>
          </h2>
        </div>

        <nav className="profile-navigation">
          <button onClick={() => navigate("/")}>
            <span>⌂</span>
            Home
          </button>

          <button onClick={() => navigate("/hotels")}>
            <span>▤</span>
            Hotels
          </button>

          <button onClick={() => navigate("/destinations")}>
            <span>⌖</span>
            Destinations
          </button>

          <button onClick={() => navigate("/bookings")}>
            <span>▣</span>
            My Bookings
          </button>

          <button onClick={() => navigate("/wishlist")}>
            <span>♡</span>
            Wishlist
          </button>

          <button className="active-profile">
            <span>◉</span>
            Profile
          </button>

          <button className="sidebar-logout" onClick={logout}>
            <span>↪</span>
            Logout
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="mountain-symbol">⌁</div>
          <p>
            Explore the world
            <br />
            with comfort
          </p>
          <div className="footer-line"></div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="profile-main">
        {/* Top Bar */}
        <header className="profile-topbar">
          <div>
            <p className="topbar-small-text">WELCOME BACK</p>
            <h1>My Profile</h1>
          </div>

          <div className="topbar-user">
            <div className="notification-icon">♧</div>

            <div className="small-avatar">{firstLetter}</div>

            <span>{userName}</span>
            <span className="topbar-arrow">⌄</span>
          </div>
        </header>

        {/* Profile Hero */}
        <section className="profile-hero">
          <div className="hero-avatar">{firstLetter}</div>

          <div className="hero-user-info">
            <p className="hero-label">YOUR ACCOUNT</p>
            <h2>{userName}</h2>

            <p className="hero-email">✉ {userEmail}</p>

            <div className="active-status">
              <span></span>
              Account Active
            </div>
          </div>

          <button
            className="edit-profile-button"
            onClick={() => navigate("/profile/edit")}
          >
            ✎ Edit Profile
          </button>
        </section>

        {/* Dashboard Grid */}
        <section className="profile-grid">
          {/* Personal Information */}
          <div className="profile-panel personal-panel">
            <div className="panel-heading">
              <div className="panel-icon">♙</div>

              <div>
                <h2>Personal Information</h2>
                <p>Your account details and personal information</p>
              </div>
            </div>

            <div className="personal-details">
              <div className="detail-row">
                <div className="detail-icon">♙</div>

                <div>
                  <span>FULL NAME</span>
                  <strong>{userName}</strong>
                </div>
              </div>

              <div className="detail-divider"></div>

              <div className="detail-row">
                <div className="detail-icon">✉</div>

                <div>
                  <span>EMAIL ADDRESS</span>
                  <strong>{userEmail}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="profile-panel quick-actions-panel">
            <div className="panel-heading">
              <div className="panel-icon">♛</div>

              <div>
                <h2>Quick Actions</h2>
                <p>Manage your account</p>
              </div>
            </div>

            <div className="quick-actions">
              <button onClick={() => navigate("/profile/edit")}>
                <span>✎</span>
                Edit Profile
                <b>›</b>
              </button>

              <button onClick={() => navigate("/bookings")}>
                <span>▣</span>
                View Bookings
                <b>›</b>
              </button>

              <button onClick={() => navigate("/wishlist")}>
                <span>♡</span>
                Wishlist
                <b>›</b>
              </button>
            </div>
          </div>

          {/* Travel Journey */}
          <div className="profile-panel travel-panel">
            <div className="panel-heading">
              <div className="panel-icon">✈</div>

              <div>
                <h2>Your Travel Journey</h2>
                <p>Explore destinations and create unforgettable memories</p>
              </div>
            </div>

            <div className="travel-stats">
              <div>
                <strong>0</strong>
                <span>Bookings</span>
              </div>

              <div>
                <strong>0</strong>
                <span>Wishlist Items</span>
              </div>

              <div>
                <strong>0</strong>
                <span>Reviews</span>
              </div>
            </div>
          </div>

          {/* Help Panel */}
          <div className="help-panel">
            <div className="help-icon">♧</div>

            <h2>Need Help?</h2>
            <p>Our support team is here to help you.</p>

            <button onClick={() => navigate("/contact")}>
              Contact Support <span>›</span>
            </button>
          </div>
        </section>

        {/* Bottom Message */}
        <footer className="profile-footer">
          <span>♡</span>
          <p>Thank you for being part of HotelBooking!</p>

          <div className="footer-slogan">
            <span></span>
            Better Stays. Brighter Journeys.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Profile;
