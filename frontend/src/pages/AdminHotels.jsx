import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminHotels.css";

const FALLBACK_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

const AdminHotels = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // GET ALL HOTELS
  // ======================================================
  const fetchHotels = async () => {
    try {
      setLoading(true);

      const response = await API.get("/admin/hotels");

      /*
       * Your backend returns:
       *
       * res.status(200).json(hotels);
       *
       * Therefore response.data is already the array.
       */
      setHotels(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("=================================");
      console.error("GET HOTELS ERROR");
      console.error("=================================");
      console.error(error);

      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to load hotels. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD HOTELS WHEN PAGE OPENS
  // ======================================================
  useEffect(() => {
    fetchHotels();
  }, []);

  // ======================================================
  // DELETE HOTEL
  // ======================================================
  const handleDelete = async (id) => {
    if (!id) {
      alert("Invalid hotel ID.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this hotel?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/admin/hotels/${id}`);

      alert("Hotel deleted successfully!");

      // Remove hotel from UI immediately
      setHotels((currentHotels) =>
        currentHotels.filter((hotel) => hotel._id !== id),
      );
    } catch (error) {
      console.error("=================================");
      console.error("DELETE HOTEL ERROR");
      console.error("=================================");
      console.error(error);

      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed to delete hotel. Please try again.",
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="admin-hotels-page">
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="admin-hotels-header">
        <div>
          <h1>Manage Hotels</h1>

          <p>View, update and manage all hotels in your booking system.</p>
        </div>

        <button
          type="button"
          className="add-new-hotel-btn"
          onClick={() => navigate("/admin/hotels/add")}
        >
          + Add New Hotel
        </button>
      </div>

      {/* ==================================================
          HOTEL COUNT
      ================================================== */}
      <div className="hotel-count-card">
        <div className="count-icon">🏨</div>

        <div>
          <span>Total Hotels</span>

          <strong>{hotels.length}</strong>
        </div>
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}
      {loading && <div className="loading-message">Loading hotels...</div>}

      {/* ==================================================
          NO HOTELS
      ================================================== */}
      {!loading && hotels.length === 0 && (
        <div className="no-hotels">
          <div>🏨</div>

          <h2>No Hotels Found</h2>

          <p>You haven't added any hotels yet.</p>

          <button type="button" onClick={() => navigate("/admin/hotels/add")}>
            Add Your First Hotel
          </button>
        </div>
      )}

      {/* ==================================================
          HOTELS
      ================================================== */}
      {!loading && hotels.length > 0 && (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div className="admin-hotel-card" key={hotel._id}>
              {/* ==================================================
                  IMAGE
              ================================================== */}
              <div className="hotel-image-container">
                <img
                  src={hotel.image || FALLBACK_HOTEL_IMAGE}
                  alt={hotel.name || "Hotel"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_HOTEL_IMAGE;
                  }}
                />

                <div className="price-badge">
                  ${Number(hotel.price || 0).toLocaleString()} / night
                </div>
              </div>

              {/* ==================================================
                  HOTEL INFORMATION
              ================================================== */}
              <div className="hotel-info">
                <h2>{hotel.name}</h2>

                <p className="hotel-location">📍 {hotel.location}</p>

                <p className="hotel-description">{hotel.description}</p>

                <p className="hotel-rooms">🛏️ {hotel.rooms || 0} rooms</p>

                {/* ==================================================
                    BUTTONS
                ================================================== */}
                <div className="hotel-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => navigate(`/admin/hotels/edit/${hotel._id}`)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
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
