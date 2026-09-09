import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminHotels.css";

const AdminHotels = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all hotels
  const fetchHotels = async () => {
    try {
      const response = await API.get("/hotels");

      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);

      alert("Failed to load hotels.");
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
      await API.delete(`/admin/hotels/${id}`);

      alert("Hotel deleted successfully!");

      // Remove deleted hotel from UI
      setHotels(hotels.filter((hotel) => hotel._id !== id));
    } catch (error) {
      console.error("Delete error:", error);

      alert(error.response?.data?.message || "Failed to delete hotel.");
    }
  };

  return (
    <div className="admin-hotels-page">
      {/* Header */}
      <div className="admin-hotels-header">
        <div>
          <h1>Manage Hotels</h1>

          <p>View, update and manage all hotels in your booking system.</p>
        </div>

        <button
          className="add-new-hotel-btn"
          onClick={() => navigate("/admin/hotels/add")}
        >
          + Add New Hotel
        </button>
      </div>

      {/* Hotel Count */}
      <div className="hotel-count-card">
        <div className="count-icon">🏨</div>

        <div>
          <span>Total Hotels</span>
          <strong>{hotels.length}</strong>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="loading-message">Loading hotels...</div>}

      {/* No Hotels */}
      {!loading && hotels.length === 0 && (
        <div className="no-hotels">
          <div>🏨</div>

          <h2>No Hotels Found</h2>

          <p>You haven't added any hotels yet.</p>

          <button onClick={() => navigate("/admin/hotels/add")}>
            Add Your First Hotel
          </button>
        </div>
      )}

      {/* Hotels */}
      {!loading && hotels.length > 0 && (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div className="admin-hotel-card" key={hotel._id}>
              {/* Image */}
              <div className="hotel-image-container">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                <div className="price-badge">${hotel.price} / night</div>
              </div>

              {/* Information */}
              <div className="hotel-info">
                <h2>{hotel.name}</h2>

                <p className="hotel-location">📍 {hotel.location}</p>

                <p className="hotel-description">{hotel.description}</p>

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

export default AdminHotels;
