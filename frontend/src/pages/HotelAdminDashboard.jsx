import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "./HotelAdminDashboard.css";

function HotelAdminDashboard() {
  const [hotel, setHotel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    rooms: "",
    image: "",
  });

  // ==========================================
  // GET ASSIGNED HOTEL
  // ==========================================
  const fetchMyHotel = async () => {
    try {
      setLoading(true);

      const response = await API.get("/hotels/my-hotel");

      setHotel(response.data);

      setFormData({
        name: response.data.name || "",
        location: response.data.location || "",
        description: response.data.description || "",
        price: response.data.price || "",
        rooms: response.data.rooms || "",
        image: response.data.image || "",
      });
    } catch (error) {
      console.error("Get my hotel error:", error);

      alert(
        error.response?.data?.message || "Failed to load your assigned hotel",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHotel();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // START EDIT
  // ==========================================
  const handleEdit = () => {
    setEditing(true);
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================
  const handleCancel = () => {
    if (!hotel) return;

    setFormData({
      name: hotel.name || "",
      location: hotel.location || "",
      description: hotel.description || "",
      price: hotel.price || "",
      rooms: hotel.rooms || "",
      image: hotel.image || "",
    });

    setEditing(false);
  };

  // ==========================================
  // SAVE HOTEL
  // ==========================================
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await API.put("/hotels/my-hotel", {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price: Number(formData.price),
        rooms: Number(formData.rooms),
        image: formData.image,
      });

      setHotel(response.data.hotel);

      setEditing(false);

      alert("Hotel updated successfully.");
    } catch (error) {
      console.error("Update hotel error:", error);

      alert(error.response?.data?.message || "Failed to update hotel");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // IMAGE URL
  // ==========================================
  const getImage = (image) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `http://localhost:5000${image}`;
    }

    return `http://localhost:5000/uploads/${image}`;
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="hotel-admin-dashboard">
        <div className="dashboard-loading">
          <h2>Loading your hotel...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO HOTEL
  // ==========================================
  if (!hotel) {
    return (
      <div className="hotel-admin-dashboard">
        <div className="no-hotel-card">
          <h2>No Hotel Assigned</h2>

          <p>
            Your account is a Hotel Admin, but no hotel has been assigned to you
            yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-admin-dashboard">
      {/* ========================================
          HEADER
      ======================================== */}
      <div className="dashboard-header">
        <div>
          <h1>Hotel Admin Dashboard</h1>

          <p>Manage your assigned hotel information.</p>
        </div>

        {!editing && (
          <button className="edit-hotel-button" onClick={handleEdit}>
            ✏️ Edit Hotel
          </button>
        )}
      </div>

      {/* ========================================
          HOTEL INFORMATION
      ======================================== */}
      {!editing ? (
        <div className="hotel-dashboard-content">
          {/* IMAGE */}
          <div className="hotel-image-card">
            <img
              src={getImage(hotel.image)}
              alt={hotel.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200";
              }}
            />
          </div>

          {/* DETAILS */}
          <div className="hotel-details-card">
            <div className="hotel-title-section">
              <h2>{hotel.name}</h2>

              <span className="assigned-badge">Assigned to you</span>
            </div>

            <div className="hotel-info-grid">
              <div className="info-item">
                <span className="info-label">📍 Location</span>

                <strong>{hotel.location}</strong>
              </div>

              <div className="info-item">
                <span className="info-label">💰 Price</span>

                <strong>{hotel.price} per night</strong>
              </div>

              <div className="info-item">
                <span className="info-label">🛏️ Rooms</span>

                <strong>{hotel.rooms}</strong>
              </div>

              <div className="info-item">
                <span className="info-label">👤 Administrator</span>

                <strong>{hotel.hotelAdmin?.name || "You"}</strong>
              </div>
            </div>

            <div className="description-section">
              <h3>Description</h3>

              <p>{hotel.description || "No description available."}</p>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================
           EDIT FORM
        ======================================== */
        <div className="edit-hotel-card">
          <h2>Edit Hotel Information</h2>

          <form onSubmit={handleSave}>
            <div className="edit-form-grid">
              {/* NAME */}
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

              {/* LOCATION */}
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

              {/* PRICE */}
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

              {/* ROOMS */}
              <div className="form-group">
                <label>Number of Rooms</label>

                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {/* IMAGE */}
              <div className="form-group full-width">
                <label>Hotel Image</label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Image URL or filename"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="form-group full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>
            </div>

            <div className="edit-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button type="submit" className="save-button" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default HotelAdminDashboard;
