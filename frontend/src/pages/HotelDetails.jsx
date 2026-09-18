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

        if (!id) {
          setError("Hotel ID is missing.");
          return;
        }

        const response = await axios.get(`${API_URL}/api/hotels/${id}`);

        setHotel(response.data);
      } catch (err) {
        console.error("Failed to load hotel:", err);

        setError(err?.response?.data?.message || "Unable to load this hotel.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // ========================================
  // GET HOTEL ID
  // ========================================

  const getHotelId = () => {
    return hotel?._id || hotel?.id || id;
  };

  // ========================================
  // GET HOTEL IMAGE
  // ========================================

  const getHotelImage = (image) => {
    if (!image) {
      return fallbackImg;
    }

    const imageUrl = String(image).trim();

    // External image
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // Backend path such as:
    // /uploads/hotel.jpg
    if (imageUrl.startsWith("/")) {
      return `${API_URL}${imageUrl}`;
    }

    // Filename such as:
    // hotel.jpg
    return `${API_URL}/uploads/${imageUrl}`;
  };

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

    const hotelId = getHotelId();

    if (!hotelId) {
      alert("Hotel information is unavailable.");
      return;
    }

    navigate(`/booking/hotel/${hotelId}`);
  };

  // ========================================
  // GO BACK
  // ========================================

  const handleBack = () => {
    navigate("/hotels");
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
  // ERROR / NOT FOUND
  // ========================================

  if (error || !hotel) {
    return (
      <div className="hotel-not-found">
        <div className="not-found-icon">🏨</div>

        <h2>Hotel not found</h2>

        <p>{error || "We couldn't find the hotel you're looking for."}</p>

        <button className="back-hotels-btn" onClick={handleBack}>
          ← Back to Hotels
        </button>
      </div>
    );
  }

  // ========================================
  // SAFE HOTEL VALUES
  // ========================================

  const hotelName = hotel.name || hotel.hotelName || "Hotel";

  const location = hotel.location || hotel.city || "Location unavailable";

  const description =
    hotel.description ||
    "Enjoy a comfortable stay with excellent service and convenient facilities.";

  const price = Number(hotel.price ?? 0);

  const rooms = Number(hotel.rooms ?? 0);

  const rating = Number(hotel.rating ?? 0);

  const reviews = Number(hotel.reviews ?? 0);

  const hotelImage = getHotelImage(hotel.image);

  // ========================================
  // RENDER
  // ========================================

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
            onError={(event) => {
              console.error("Hotel image failed:", hotelImage);

              event.currentTarget.onerror = null;
              event.currentTarget.src = fallbackImg;
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

          {/* LOCATION */}

          <div className="details-location">📍 {location}</div>

          {/* =====================================
              RATING
          ===================================== */}

          <div className="details-rating">
            <span className="stars">
              {"★★★★★".split("").map((star, index) => (
                <span
                  key={index}
                  className={index < Math.round(rating) ? "filled" : ""}
                >
                  {star}
                </span>
              ))}
            </span>

            <span className="rating-number">
              {rating > 0 ? `${rating.toFixed(1)}/5` : "No rating yet"}
            </span>

            {reviews > 0 && (
              <span className="reviews-count">({reviews} reviews)</span>
            )}
          </div>

          {/* =====================================
              DESCRIPTION
          ===================================== */}

          <p className="details-description">{description}</p>

          {/* =====================================
              HOTEL INFORMATION
          ===================================== */}

          <div className="hotel-info-row">
            {/* PRICE */}

            <div className="info-item">
              <span className="info-icon">💰</span>

              <div>
                <small>Price</small>

                <strong>ETB {price.toLocaleString()}</strong>

                <small>per night</small>
              </div>
            </div>

            {/* ROOMS */}

            <div className="info-item">
              <span className="info-icon">🛏️</span>

              <div>
                <small>Rooms</small>

                <strong>{rooms}</strong>

                <small>
                  {rooms === 1 ? "room available" : "rooms available"}
                </small>
              </div>
            </div>

            {/* RATING */}

            <div className="info-item">
              <span className="info-icon">⭐</span>

              <div>
                <small>Rating</small>

                <strong>{rating > 0 ? rating.toFixed(1) : "N/A"}</strong>

                <small>guest rating</small>
              </div>
            </div>
          </div>

          {/* =====================================
              BOOKING BUTTON
          ===================================== */}

          <button
            className="book-now-btn"
            onClick={handleBooking}
            type="button"
          >
            <span>🏨</span>
            Book This Hotel
            <span className="book-arrow">→</span>
          </button>

          {/* =====================================
              BACK BUTTON
          ===================================== */}

          <button
            className="back-hotels-btn"
            onClick={handleBack}
            type="button"
          >
            ← Back to Hotels
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
