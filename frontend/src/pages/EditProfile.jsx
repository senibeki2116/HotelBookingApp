import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./EditProfile.css";

function EditProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();

    // Save the edited information locally for now
    const updatedUser = {
      ...user,
      name,
      email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setMessage("Profile updated successfully!");

    setTimeout(() => {
      navigate("/profile");
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-card">
        {/* Header */}
        <div className="edit-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/profile")}
          >
            ←
          </button>

          <div>
            <p>ACCOUNT SETTINGS</p>
            <h1>Edit Profile</h1>
          </div>
        </div>

        {/* Avatar */}
        <div className="edit-avatar">{name.charAt(0).toUpperCase() || "U"}</div>

        <form onSubmit={handleSave}>
          {/* Full Name */}
          <div className="form-group">
            <label>FULL NAME</label>

            <div className="input-wrapper">
              <span>♙</span>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label>EMAIL ADDRESS</label>

            <div className="input-wrapper">
              <span>✉</span>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Message */}
          {message && <div className="success-message">✓ {message}</div>}

          {/* Buttons */}
          <div className="edit-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>

            <button type="submit" className="save-profile-button">
              ✓ Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
