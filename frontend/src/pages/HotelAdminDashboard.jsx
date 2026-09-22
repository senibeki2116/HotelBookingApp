import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminDashboard.css";

const HotelAdminDashboard = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEdit, setShowEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    image: "",
    rooms: "",
  });

  // ==========================
  // Get My Hotel
  // ==========================
  const fetchMyHotel = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/hotels/my-hotel");

      setHotel(response.data);

      setFormData({
        name: response.data.name || "",
        location: response.data.location || "",
        description: response.data.description || "",
        price: response.data.price || "",
        image: response.data.image || "",
        rooms: response.data.rooms || "",
      });
    } catch (error) {
      console.error("GET MY HOTEL ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your hotel information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHotel();
  }, []);

  // ==========================
  // Input Change
  // ==========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Update Hotel
  // ==========================
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await API.put("/hotels/my-hotel", {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        rooms: Number(formData.rooms),
      });

      setHotel(response.data.hotel || response.data);

      setShowEdit(false);

      alert("Hotel information updated successfully.");
    } catch (error) {
      console.error("UPDATE HOTEL ERROR:", error);

      alert(
        error.response?.data?.message || "Unable to update hotel information.",
      );
    }
  };

  // ==========================
  // Logout
  // ==========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="hotel-admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading your hotel...</p>
      </div>
    );
  }

  // ==========================
  // Error
  // ==========================
  if (error) {
    return (
      <div className="hotel-admin-error">
        <h2>Unable to load hotel</h2>
        <p>{error}</p>

        <button onClick={fetchMyHotel}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="hotel-admin-layout">
      {/* ==========================
          SIDEBAR
      ========================== */}
      <aside className="hotel-admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏨</div>

          <div>
            <h2>Hotel Admin</h2>
            <span>Management Panel</span>
          </div>
        </div>

        <div className="sidebar-menu">
          {/* Dashboard */}
          <button
            className="sidebar-item active"
            onClick={() => navigate("/admin/hotel-dashboard")}
          >
            <span className="sidebar-icon">🏠</span>
            <span>Dashboard</span>
          </button>

          {/* Bookings */}
          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <span className="sidebar-icon">📅</span>
            <span>Bookings</span>
          </button>

          {/* View Website */}
          <button className="sidebar-item" onClick={() => navigate("/")}>
            <span className="sidebar-icon">🌐</span>
            <span>View Website</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          {/* Logout */}
          <button className="sidebar-item logout-item" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================
          MAIN CONTENT
      ========================== */}
      <main className="hotel-admin-main">
        {/* Header */}
        <header className="hotel-admin-header">
          <div>
            <h1>Dashboard</h1>

            <p>Manage your hotel and view your hotel activity.</p>
          </div>

          <div className="admin-welcome">
            <span>Welcome,</span>
            <strong>{hotel?.hotelAdmin?.name || "Hotel Admin"} 👋</strong>
          </div>
        </header>

        {/* ==========================
            STATS
        ========================== */}
        <section className="hotel-stats">
          <div className="stat-card">
            <div className="stat-icon">🏨</div>

            <div>
              <span>Hotel</span>
              <strong>{hotel?.name || "My Hotel"}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚪</div>

            <div>
              <span>Total Rooms</span>
              <strong>{hotel?.rooms || 0}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>

            <div>
              <span>Price / Night</span>
              <strong>${hotel?.price || 0}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📍</div>

            <div>
              <span>Location</span>
              <strong>{hotel?.location || "-"}</strong>
            </div>
          </div>
        </section>

        {/* ==========================
            HOTEL SECTION
        ========================== */}
        <section className="hotel-section">
          <div className="section-header">
            <div>
              <h2>My Hotel</h2>

              <p>Manage information about your assigned hotel.</p>
            </div>

            <button
              className="edit-hotel-btn"
              onClick={() => setShowEdit(true)}
            >
              ✏️ Edit Hotel
            </button>
          </div>

          {/* Hotel Card */}
          <div className="hotel-admin-card">
            <div className="hotel-image-container">
              <img
                src={
                  hotel?.image ||
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200"
                }
                alt={hotel?.name || "Hotel"}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200";
                }}
              />
            </div>

            <div className="hotel-card-content">
              <h2>{hotel?.name}</h2>

              <p className="hotel-location">📍 {hotel?.location}</p>

              <p className="hotel-description">{hotel?.description}</p>

              <div className="hotel-details">
                <div>
                  <span>Price</span>
                  <strong>${hotel?.price} / night</strong>
                </div>

                <div>
                  <span>Rooms</span>
                  <strong>{hotel?.rooms}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Booking Button */}
          <div className="quick-booking-section">
            <div>
              <h3>Manage Your Bookings</h3>

              <p>View and manage bookings made for your hotel.</p>
            </div>

            <button
              className="view-bookings-btn"
              onClick={() => navigate("/admin/hotel-bookings")}
            >
              View Bookings →
            </button>
          </div>
        </section>
      </main>

      {/* ==========================
          EDIT MODAL
      ========================== */}
      {showEdit && (
        <div className="hotel-modal-overlay">
          <div className="hotel-modal">
            <div className="modal-header">
              <div>
                <h2>Edit Hotel</h2>
                <p>Update your hotel information.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowEdit(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Hotel Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Night</label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rooms</label>

                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/hotel.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelAdminDashboard;
