import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <Link to="/">Home</Link>

      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/my-bookings">My Bookings</Link>

          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
