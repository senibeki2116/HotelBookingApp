import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiHome,
  FiUser,
  FiCalendar,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
} from "react-icons/fi";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Hotel Logo / Brand */}
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="brand-icon">✦</span>
        <span>Hotel Booking</span>
      </Link>

      {/* Hamburger Menu */}
      <div
        className="menu-wrapper"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <button
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Dropdown Menu */}
        <div className={`dropdown-menu ${menuOpen ? "show" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            <FiHome />
            <span>Home</span>
          </Link>

          {user ? (
            <>
              <Link to="/profile" onClick={closeMenu}>
                <FiUser />
                <span>Profile</span>
              </Link>

              <Link to="/my-bookings" onClick={closeMenu}>
                <FiCalendar />
                <span>My Bookings</span>
              </Link>

              <div className="menu-divider"></div>

              <button
                className="logout-button"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="menu-divider"></div>

              <Link to="/login" onClick={closeMenu}>
                <FiLogIn />
                <span>Login</span>
              </Link>

              <Link to="/register" onClick={closeMenu}>
                <FiUserPlus />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
