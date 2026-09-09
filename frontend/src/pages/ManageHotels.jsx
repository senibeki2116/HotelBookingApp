import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./ManageHotels.css";

const ManageHotels = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all hotels
  const fetchHotels = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await API.get("/hotels");

      setHotels(response.data);
    } catch (error) {
      console.error("Fetch hotels error:", error);

      setError(error.response?.data?.message || "Failed to load hotels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Delete hotel
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this hotel?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/admin/hotels/${id}`);

      alert("Hotel deleted successfully!");

      setHotels((previousHotels) =>
        previousHotels.filter((hotel) => hotel._id !== id),
      );
    } catch (error) {
      console.error("Delete hotel error:", error);

      alert(error.response?.data?.message || "Failed to delete hotel.");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="manage-hotels-page">
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-hotels-page">
      {/* Header */}
      <div className="manage-header">
        <div>
          <span className="page-label">ADMIN PANEL</span>

          <h1>Manage Hotels</h1>

          <p>View, edit and manage all hotels in your system.</p>
        </div>

        <button
          className="add-hotel-btn"
          onClick={() => navigate("/admin/add-hotel")}
        >
          <span>+</span>
          Add Hotel
        </button>
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Hotel Count */}
      <div className="hotel-summary">
        <div>
          <strong>{hotels.length}</strong>
          <span>Total Hotels</span>
        </div>
      </div>

      {/* Hotels */}
      {hotels.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏨</div>

          <h2>No Hotels Found</h2>

          <p>There are currently no hotels in the system.</p>

          <button
            className="add-hotel-btn"
            onClick={() => navigate("/admin/add-hotel")}
          >
            + Add Your First Hotel
          </button>
        </div>
      ) : (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div className="hotel-card" key={hotel._id}>
              {/* Hotel Image */}
              <div className="hotel-image-wrapper">
                <img
                  src={
                    hotel.image ||
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={hotel.name || "Hotel"}
                  className="hotel-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";
                  }}
                  alt={hotel.name}
                  className="hotel-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";
                  }}
                />

                <div className="hotel-badge">Available</div>
              </div>

              {/* Hotel Information */}
              <div className="hotel-content">
                <h2>{hotel.name}</h2>

                <div className="hotel-location">
                  <span>📍</span>
                  <span>{hotel.location}</span>
                </div>

                {/* PRICE */}
                <div className="hotel-price">
                  <strong>${hotel.price}</strong>

                  <span>/ night</span>
                </div>

                {/* Buttons */}
                <div className="hotel-actions">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(`/admin/hotels/edit/${hotel._id}`)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(hotel._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
