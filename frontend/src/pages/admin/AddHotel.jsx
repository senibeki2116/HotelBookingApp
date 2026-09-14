import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import "./AddHotel.css";

function AddHotel() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter the hotel name.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter the hotel location.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a hotel description.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!formData.image.trim()) {
      setError("Please enter an image URL.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/hotels", {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        image: formData.image.trim(),
      });

      setSuccess("Hotel added successfully!");

      setFormData({
        name: "",
        location: "",
        description: "",
        price: "",
        image: "",
      });

      setTimeout(() => {
        navigate("/admin/hotels");
      }, 1500);
    } catch (err) {
      console.error("Add hotel error:", err);

      setError(
        err.response?.data?.message || "Failed to add hotel. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/hotels");
  };

  return (
    <div className="add-hotel-page">
      {/* =========================================
          HEADER
      ========================================= */}
      <header className="add-hotel-header">
        <div className="header-left">
          {/* BACK BUTTON */}
          <button
            type="button"
            className="back-button"
            onClick={handleCancel}
            aria-label="Go back"
          >
            ←
          </button>

          {/* HOTEL ICON - LEFT SIDE */}
          <div className="header-icon">🏨</div>

          {/* TITLE */}
          <div className="header-title">
            <p className="header-eyebrow">HOTEL MANAGEMENT</p>

            <h1>Add New Hotel</h1>

            <p className="header-subtitle">
              Create a beautiful listing for your guests.
            </p>
          </div>
        </div>
      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <main className="add-hotel-container">
        {/* =========================================
            FORM CARD
        ========================================= */}
        <section className="add-hotel-card">
          {/* CARD TITLE */}
          <div className="card-title">
            <div className="title-icon">✦</div>

            <div>
              <h2>Hotel Information</h2>

              <p>Enter the details of the hotel below.</p>
            </div>
          </div>

          {/* =========================================
              ALERTS
          ========================================= */}

          {error && (
            <div className="form-alert error">
              <span className="alert-icon">⚠</span>

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-alert success">
              <span className="alert-icon">✓</span>

              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* =========================================
                BASIC INFORMATION
            ========================================= */}

            <div className="section-heading">
              <span>01</span>

              <div>
                <h3>Basic Information</h3>

                <p>Tell guests about this hotel.</p>
              </div>
            </div>

            <div className="form-grid">
              {/* HOTEL NAME */}
              <div className="form-group">
                <label htmlFor="name">
                  Hotel Name
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🏨</span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Grand Palace Hotel"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* LOCATION */}
              <div className="form-group">
                <label htmlFor="location">
                  Location
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">📍</span>

                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Addis Ababa, Ethiopia"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group full-width">
              <label htmlFor="description">
                Description
                <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the hotel, rooms, amenities, location and what makes it special..."
                rows="6"
              />

              <div className="character-count">
                {formData.description.length} characters
              </div>
            </div>

            {/* =========================================
                PRICING
            ========================================= */}

            <div className="section-heading pricing-heading">
              <span>02</span>

              <div>
                <h3>Pricing</h3>

                <p>Set the nightly rate for this hotel.</p>
              </div>
            </div>

            <div className="form-grid">
              {/* PRICE */}
              <div className="form-group">
                <label htmlFor="price">
                  Price Per Night
                  <span>*</span>
                </label>

                <div className="price-input-wrapper">
                  <span className="currency">$</span>

                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />

                  <span className="per-night">/ night</span>
                </div>
              </div>

              {/* PRICE TIP */}
              <div className="price-info">
                <span className="price-info-icon">💡</span>

                <div>
                  <strong>Pricing tip</strong>

                  <p>Set a competitive nightly price to attract more guests.</p>
                </div>
              </div>
            </div>

            {/* =========================================
                IMAGE
            ========================================= */}

            <div className="section-heading image-heading">
              <span>03</span>

              <div>
                <h3>Hotel Image</h3>

                <p>Add a high-quality image for your listing.</p>
              </div>
            </div>

            <div className="image-section">
              {/* IMAGE URL */}
              <div className="form-group image-url-group">
                <label htmlFor="image">
                  Image URL
                  <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🖼️</span>

                  <input
                    id="image"
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/hotel-image.jpg"
                    autoComplete="off"
                  />
                </div>

                <small>Use a direct URL to a hotel image.</small>
              </div>

              {/* IMAGE PREVIEW */}
              <div className="image-preview">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Hotel preview"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";

                      const placeholder =
                        e.currentTarget.parentElement.querySelector(
                          ".preview-placeholder",
                        );

                      if (placeholder) {
                        placeholder.style.display = "flex";
                      }
                    }}
                  />
                ) : null}

                <div
                  className="preview-placeholder"
                  style={{
                    display: formData.image ? "none" : "flex",
                  }}
                >
                  <span>🏨</span>

                  <p>Image Preview</p>

                  <small>Your hotel image will appear here</small>
                </div>
              </div>
            </div>

            {/* =========================================
                BUTTONS
            ========================================= */}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={loading}
              >
                <span>←</span>
                Cancel
              </button>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Adding Hotel...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Add Hotel
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =========================================
            SIDEBAR
        ========================================= */}

        <aside className="add-hotel-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-icon">✨</div>

            <h3>Create a great listing</h3>

            <p>
              High-quality information and beautiful images help guests choose
              the right hotel.
            </p>

            <div className="sidebar-tips">
              <div>
                <span>✓</span>

                <p>Use a clear hotel name</p>
              </div>

              <div>
                <span>✓</span>

                <p>Add the correct location</p>
              </div>

              <div>
                <span>✓</span>

                <p>Write an attractive description</p>
              </div>

              <div>
                <span>✓</span>

                <p>Add a high-quality image</p>
              </div>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div className="secure-admin-card">
            <span>🔒</span>

            <div>
              <strong>Admin Area</strong>

              <p>Only authorized administrators can manage hotel listings.</p>
            </div>
          </div>
        </aside>
      </main>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="add-hotel-footer">
        <p>© 2026 StayLux Hotel Booking System</p>

        <div>
          <span>Secure</span>

          <span>•</span>

          <span>Professional</span>

          <span>•</span>

          <span>Easy Management</span>
        </div>
      </footer>
    </div>
  );
}

export default AddHotel;
