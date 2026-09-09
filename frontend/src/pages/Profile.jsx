import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>

        <h1>My Profile</h1>

        {user && (
          <>
            <div className="profile-info">
              <div className="info-box">
                <h3>Full Name</h3>
                <p>{user.name}</p>
              </div>

              <div className="info-box">
                <h3>Email</h3>
                <p>{user.email}</p>
              </div>
            </div>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
