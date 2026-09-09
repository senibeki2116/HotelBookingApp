import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import "./EditHotel.css";

const EditHotel = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // GET HOTEL
  // =========================
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/hotels/${id}`);

        const hotel = response.data;

        console.log("Hotel loaded:", hotel);

        setFormData({
          name: hotel.name || "",
          location: hotel.location || "",
          price: hotel.price || "",
          image: hotel.image || "",
          description: hotel.description || "",
        });
      } catch (error) {
        console.error("Error loading hotel:", error);

        setError(error.response?.data?.message || "Failed to load hotel.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotel();
    }
  }, [id]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // UPDATE HOTEL
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      console.log("Updating hotel:", id);
      console.log("Token exists:", !!token);

      const response = await API.put(`/admin/hotels/${id}`, formData);

      console.log("Hotel updated:", response.data);

      alert("Hotel updated successfully!");

      navigate("/admin/hotels");
    } catch (error) {
      console.error("Error updating hotel:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Server message:", error.response.data);
      }
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="edit-hotel-page">
        <div className="edit-loading">Loading hotel...</div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <div className="edit-hotel-page">
      <div className="edit-hotel-container">
        {/* HEADER */}
        <div className="edit-header">
          <div>
            <span>ADMIN PANEL</span>

            <h1>Edit Hotel</h1>

            <p>Update the information of your hotel.</p>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/admin/manage-hotels")}
          >
            ← Back
          </button>
        </div>

        {/* ERROR */}
        {error && <div className="edit-error">{error}</div>}

        {/* FORM */}
        <form className="edit-hotel-form" onSubmit={handleSubmit}>
          {/* HOTEL NAME */}
          <div className="form-group">
            <label>Hotel Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hotel name"
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
              placeholder="Enter hotel location"
              required
            />
          </div>

          {/* PRICE */}
          <div className="form-group">
            <label>Price Per Night</label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>Hotel Image URL</label>

            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/hotel.jpg"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter hotel description"
              rows="5"
            />
          </div>

          {/* IMAGE PREVIEW */}
          {formData.image && (
            <div className="image-preview">
              <p>Image Preview</p>

              <img
                src={formData.image}
                alt="Hotel preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* BUTTONS */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin/manage-hotels")}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHotel;
