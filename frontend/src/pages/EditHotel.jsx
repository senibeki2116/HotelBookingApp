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
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchHotel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get(`/hotels/${id}`);

        // Support either { hotel: {...} } or a direct hotel object.
        const hotel = response.data?.hotel || response.data;

        if (!hotel?._id && !hotel?.id) {
          throw new Error("The server did not return a valid hotel.");
        }

        if (!cancelled) {
          setFormData({
            name: hotel.name ?? "",
            location: hotel.location ?? "",
            price: hotel.price ?? "",
            image: hotel.image ?? "",
            description: hotel.description ?? "",
          });
        }
      } catch (err) {
        console.error("Error loading hotel:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load hotel details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchHotel();
    } else {
      setError("Hotel ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!String(formData.name).trim()) {
        throw new Error("Hotel name is required.");
      }

      if (!String(formData.location).trim()) {
        throw new Error("Hotel location is required.");
      }

      if (
        formData.price === "" ||
        !Number.isFinite(Number(formData.price)) ||
        Number(formData.price) < 0
      ) {
        throw new Error("Enter a valid price per night.");
      }

      // Send only the fields accepted by the hotel controller.
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        image: formData.image.trim(),
        description: formData.description.trim(),
      };

      console.log("Saving hotel:", id, payload);

      // This is the existing admin route in adminRoutes.js.
      const response = await API.put(`/admin/hotels/${id}`, payload);

      console.log("Hotel save response:", response.data);

      setSuccess("Hotel changes saved successfully.");

      // Navigate only after the server confirms success.
      window.setTimeout(() => {
        navigate("/admin/manage-hotels");
      }, 800);
    } catch (err) {
      console.error("Error saving hotel:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to save hotel changes.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-hotel-page">
        <div className="edit-loading">Loading hotel...</div>
      </div>
    );
  }

  return (
    <div className="edit-hotel-page">
      <div className="edit-hotel-container">
        <div className="edit-header">
          <div>
            <span>ADMIN PANEL</span>
            <h1>Edit Hotel</h1>
            <p>Update your hotel's information.</p>
          </div>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/admin/manage-hotels")}
          >
            ← Back
          </button>
        </div>

        {error && (
          <div className="edit-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-success" role="status">
            {success}
          </div>
        )}

        <form className="edit-hotel-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hotel-name">Hotel Name</label>
            <input
              id="hotel-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter hotel name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hotel-location">Location</label>
            <input
              id="hotel-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter hotel location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hotel-price">Price Per Night</label>
            <input
              id="hotel-price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              step="any"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hotel-image">Hotel Image URL</label>
            <input
              id="hotel-image"
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/hotel.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="hotel-description">Description</label>
            <textarea
              id="hotel-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter hotel description"
              rows={5}
              required
            />
          </div>

          {formData.image.trim() && (
            <div className="image-preview">
              <p>Image Preview</p>
              <img
                src={formData.image.trim()}
                alt="Hotel preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
              />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              disabled={saving}
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
