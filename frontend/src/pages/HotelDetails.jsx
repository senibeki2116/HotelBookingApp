import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./HotelDetails.css";
import fallbackImg from "../images/regImage.png";

const API_URL = "http://localhost:5000";

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH HOTEL
  // ========================================

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/hotels/${id}`);

        setHotel(response.data);
      } catch (err) {
        console.error("Failed to load hotel:", err);

        setError(err?.response?.data?.message || "Unable to load this hotel.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHotel();
    }
  }, [id]);

  // ========================================
  // BOOK NOW
  // ========================================

  const handleBooking = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      const shouldLogin = window.confirm(
        "Please login to your account before booking this hotel.\n\nWould you like to login now?",
      );

      if (shouldLogin) {
        navigate("/login");
      }

      return;
    }

    if (!hotel?._id) {
      alert("Hotel information is unavailable.");
      return;
    }

    navigate(`/booking/hotel/${hotel._id}`);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <h3>Loading hotel...</h3>
        <p>Please wait while we get the hotel details.</p>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error || !hotel) {
    return (
      <div className="hotel-not-found">
        <div className="not-found-icon">🏨</div>

        <h2>Hotel not found</h2>

        <p>{error || "We couldn't find the hotel you're looking for."}</p>

        <button className="back-hotels-btn" onClick={() => navigate("/hotels")}>
          ← Back to Hotels
        </button>
      </div>
    );
  }

  // ========================================
  // HOTEL IMAGE
  // ========================================

  const hotelImage =
    hotel.image && hotel.image.startsWith("http")
      ? hotel.image
      : hotel.image
        ? `${API_URL}/uploads/${hotel.image}`
        : fallbackImg;

  // ========================================
  // SAFE VALUES
  // ========================================

  const hotelName = hotel.name || "Hotel";
  const location = hotel.location || "Location unavailable";
  const description =
    hotel.description ||
    "Enjoy a comfortable stay with excellent service and convenient facilities.";

  const price = hotel.price ?? 0;
  const rooms = hotel.rooms ?? 0;
  const rating = hotel.rating ?? 0;

  return (
    <div className="details-container">
      <div className="details-card">
        {/* =====================================
            HOTEL IMAGE
        ===================================== */}

        <div className="details-image-wrapper">
          <img
            src={hotelImage}
            alt={hotelName}
            className="details-image"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />

          <div className="details-image-badge">✓ Available</div>
        </div>

        {/* =====================================
            HOTEL INFORMATION
        ===================================== */}

        <div className="details-content">
          <span className="details-label">HOTEL DETAILS</span>

          <h1>{hotelName}</h1>

          <div className="details-location">📍 {location}</div>

          {/* Rating */}

          <div className="details-rating">
            <span className="stars">
              {"★".repeat(Math.min(5, Math.max(0, Math.round(rating))))}
            </span>

            <span className="rating-number">
              {rating > 0 ? `${rating}/5` : "No rating yet"}
            </span>
          </div>

          {/* Description */}

          <p className="details-description">{description}</p>

          {/* =====================================
              HOTEL INFORMATION
          ===================================== */}

          <div className="hotel-info-row">
            <div className="info-item">
              <span className="info-icon">💰</span>

              <div>
                <small>Price</small>

                <strong>ETB {Number(price).toLocaleString()}</strong>

                <small>per night</small>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🛏️</span>

              <div>
                <small>Rooms</small>

                <strong>{rooms}</strong>

                <small>
                  {Number(rooms) === 1 ? "room available" : "rooms available"}
                </small>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">⭐</span>

              <div>
                <small>Rating</small>

                <strong>{rating > 0 ? rating : "N/A"}</strong>

                <small>guest rating</small>
              </div>
            </div>
          </div>

          {/* =====================================
              BOOKING BUTTON
          ===================================== */}

          <button className="book-now-btn" onClick={handleBooking}>
            <span>🏨</span>
            Book This Hotel
            <span className="book-arrow">→</span>
          </button>

          {/* =====================================
              BACK BUTTON
          ===================================== */}

          <button
            className="back-hotels-btn"
            onClick={() => navigate("/hotels")}
          >
            ← Back to Hotels
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
