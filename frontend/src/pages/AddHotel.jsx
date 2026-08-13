import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AddHotel.css";

const AddHotel = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    image: "",
    rooms: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setHotel({
      ...hotel,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      console.log("Token exists:", !!token);

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response = await API.post("/admin/hotels", {
        ...hotel,
        rooms: Number(hotel.rooms) || 1,
      });

      console.log("Hotel added:", response.data);

      alert("Hotel added successfully!");

      navigate("/admin/hotels");
    } catch (err) {
      console.error("Error adding hotel:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Server response:", err.response.data);
      }

      setError(
        err.response?.data?.message || "Failed to add hotel. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-hotel-page">
      {/* Header */}
      <div className="add-hotel-header">
        <div>
          <h1>Add New Hotel</h1>
          <p>Add a new hotel to your booking platform</p>
        </div>

        <button className="back-btn" onClick={() => navigate("/admin/hotels")}>
          ← Back to Hotels
        </button>
      </div>

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <div className="add-hotel-card">
        <form onSubmit={handleSubmit}>
          {/* Hotel Information */}
          <div className="form-section">
            <h2>Hotel Information</h2>
            <p>Enter the basic information about the hotel.</p>

            <div className="form-grid">
              {/* Hotel Name */}
              <div className="form-group">
                <label>Hotel Name</label>

                <input
                  type="text"
                  name="name"
                  value={hotel.name}
                  onChange={handleChange}
                  placeholder="e.g. Grand Palace Hotel"
                  required
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>Location</label>

                <input
                  type="text"
                  name="location"
                  value={hotel.location}
                  onChange={handleChange}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label>Description</label>

                <textarea
                  name="description"
                  value={hotel.description}
                  onChange={handleChange}
                  placeholder="Describe the hotel..."
                  rows="5"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h2>Pricing</h2>
            <p>Set the hotel's price per night.</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Price Per Night</label>

                <div className="price-input">
                  <span>ETB</span>

                  <input
                    type="number"
                    name="price"
                    value={hotel.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="form-section">
            <h2>Hotel Image</h2>
            <p>Add an image URL for the hotel.</p>

            <div className="form-group">
              <label>Image URL</label>

              <input
                type="url"
                name="image"
                value={hotel.image}
                onChange={handleChange}
                placeholder="https://example.com/hotel.jpg"
                required
              />
            </div>

            {/* Image Preview */}
            {hotel.image && (
              <div className="image-preview">
                <img
                  src={hotel.image}
                  alt="Hotel preview"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin/hotels")}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "✓ Save Hotel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHotel;
