import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./HotelDetails.css";
import fallbackImg from "../images/regImage.png";

function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  // ==========================
  // Get Hotel
  // ==========================
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/hotels/${id}`
        );

        setHotel(response.data);
      } catch (error) {
        console.error("Failed to load hotel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // ==========================
  // Book Hotel
  // ==========================
  const handleBooking = () => {
  console.log("BOOK NOW CLICKED");

  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);
  console.log("HOTEL:", hotel);
  console.log("HOTEL ID:", hotel?._id);

  if (!token) {
    alert("Please login first.");
    navigate("/login");
    return;
  }

  if (!hotel?._id) {
    alert("Hotel ID is missing.");
    return;
  }

  navigate(`/booking/hotel/${hotel._id}`);
};
  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <p>Loading hotel...</p>
      </div>
    );
  }

  // ==========================
  // Hotel Not Found
  // ==========================
  if (!hotel) {
    return (
      <div className="hotel-not-found">
        <h2>Hotel not found</h2>

        <button onClick={() => navigate("/hotels")}>
          ← Back to Hotels
        </button>
      </div>
    );
  }

  // ==========================
  // Image
  // ==========================
  const hotelImage =
    hotel.image && hotel.image.startsWith("http")
      ? hotel.image
      : hotel.image
        ? `http://localhost:5000/uploads/${hotel.image}`
        : fallbackImg;

  return (
    <div className="details-container">

      <div className="details-card">

        {/* Hotel Image */}
        <div className="details-image-wrapper">
          <img
            src={hotelImage}
            alt={hotel.name}
            className="details-image"
            onError={(e) => {
              e.currentTarget.src = fallbackImg;
            }}
          />

          <div className="details-image-badge">
            🏨 Available
          </div>
        </div>

        {/* Hotel Information */}
        <div className="details-content">

          <span className="details-label">
            HOTEL DETAILS
          </span>

          <h1>{hotel.name}</h1>

          <div className="details-location">
            📍 {hotel.location}
          </div>

          <p className="details-description">
            {hotel.description}
          </p>

          {/* Hotel Information */}
          <div className="hotel-info-row">

            <div className="info-item">
              <span>💰</span>
              <div>
                <small>Price</small>
                <strong>ETB {hotel.price}</strong>
                <small>per night</small>
              </div>
            </div>

            <div className="info-item">
              <span>🛏️</span>
              <div>
                <small>Rooms</small>
                <strong>{hotel.rooms}</strong>
                <small>available</small>
              </div>
            </div>

          </div>

          {/* Login Message */}
          {showLoginMessage && (
            <div className="login-warning">

              <div className="warning-icon">
                ⚠️
              </div>

              <div className="warning-content">
                <strong>Login Required</strong>

                <p>
                  Please login to your account before booking
                  this hotel.
                </p>

                <button
                  onClick={() => navigate("/login")}
                >
                  Login Now →
                </button>
              </div>

            </div>
          )}

          {/* Book Button */}
          <button
            className="book-now-btn"
            onClick={handleBooking}
          >
            <span>🏨</span>
            Book Now
            <span className="book-arrow">→</span>
          </button>

          {/* Back Button */}
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
