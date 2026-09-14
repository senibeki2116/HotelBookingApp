import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Booking.css";

const API_URL = "http://localhost:5000";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/hotels/${id}`);

        setHotel(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load hotel information.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const difference = end - start;

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const pricePerNight = Number(hotel?.price) || 0;

  const totalPrice = pricePerNight * nights * Number(rooms);

  const getImageUrl = (image) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
    }

    if (image.startsWith("http")) {
      return image;
    }

    if (image.startsWith("/uploads/")) {
      return `${API_URL}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${API_URL}/${image}`;
    }

    return `${API_URL}/uploads/${image}`;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select your check-in and check-out dates.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (nights < 1) {
      setError("Your stay must be at least one night.");
      return;
    }

    if (Number(rooms) > Number(hotel?.rooms || 0)) {
      setError(`Only ${hotel?.rooms || 0} rooms are available.`);
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        hotelId: id,
        checkIn,
        checkOut,
        guests: Number(guests),
        rooms: Number(rooms),
      };

      const response = await axios.post(
        `${API_URL}/api/bookings`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate(`/booking-confirmation/${response.data.booking._id}`);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Unable to complete your booking.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading-screen">
        <div className="booking-spinner"></div>
        <h2>Loading hotel...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="booking-error-screen">
        <div className="booking-error-box">
          <div className="error-icon">!</div>

          <h2>Hotel Not Found</h2>

          <p>We couldn't find the hotel you're looking for.</p>

          <Link to="/hotels" className="return-hotels-btn">
            Return to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* TOP BAR */}
      <div className="booking-topbar">
        <Link to={`/hotels/${id}`} className="back-hotel-link">
          <span>←</span>
          Back to hotel
        </Link>

        <div className="secure-label">🔒 Secure reservation</div>
      </div>

      {/* HEADER */}
      <div className="booking-header">
        <div>
          <span className="booking-eyebrow">RESERVATION</span>

          <h1>Complete your booking</h1>

          <p>Choose your dates and tell us about your stay.</p>
        </div>

        <div className="booking-step">
          <span className="step-circle">1</span>
          Reservation details
        </div>
      </div>

      {/* MAIN */}
      <div className="booking-layout">
        {/* HOTEL CARD */}
        <div className="hotel-card">
          <div className="hotel-photo-wrapper">
            <img
              src={getImageUrl(hotel.image)}
              alt={hotel.name}
              className="hotel-photo"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
              }}
            />

            <div className="rating-badge">
              <span>★</span>
              {hotel.rating || 5}
            </div>
          </div>

          <div className="hotel-card-content">
            <span className="hotel-category">HOTEL</span>

            <h2>{hotel.name}</h2>

            <p className="hotel-location">📍 {hotel.location}</p>

            <div className="hotel-divider"></div>

            <div className="hotel-info-row">
              <div className="info-icon">🛏</div>

              <div>
                <small>Available rooms</small>

                <strong>{hotel.rooms || 0} rooms</strong>
              </div>
            </div>

            <div className="hotel-divider"></div>

            <div className="nightly-price">
              <small>Price per night</small>

              <div>
                <strong>ETB {pricePerNight.toLocaleString()}</strong>

                <span>/ room</span>
              </div>
            </div>
          </div>
        </div>

        {/* RESERVATION CARD */}
        <div className="reservation-card">
          <div className="reservation-title">
            <h2>Reservation details</h2>

            <p>Select your dates, guests and rooms.</p>
          </div>

          {error && (
            <div className="booking-message booking-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleBooking}>
            {/* DATES */}
            <div className="form-section">
              <div className="section-heading">
                <span className="section-number">01</span>

                <div>
                  <h3>Stay dates</h3>

                  <p>When will you be staying?</p>
                </div>
              </div>

              <div className="date-fields">
                <div className="input-group">
                  <label>CHECK-IN</label>

                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>

                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                </div>

                <div className="date-arrow">→</div>

                <div className="input-group">
                  <label>CHECK-OUT</label>

                  <div className="input-wrapper">
                    <span className="input-icon">📅</span>

                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {nights > 0 && (
                <div className="stay-duration">
                  🌙
                  <span>Your stay:</span>
                  <strong>
                    {nights} {nights === 1 ? "night" : "nights"}
                  </strong>
                </div>
              )}
            </div>

            {/* GUESTS & ROOMS */}
            <div className="form-section">
              <div className="section-heading">
                <span className="section-number">02</span>

                <div>
                  <h3>Guests & rooms</h3>

                  <p>Tell us who is staying.</p>
                </div>
              </div>

              <div className="guest-room-fields">
                <div className="input-group">
                  <label>GUESTS</label>

                  <div className="input-wrapper">
                    <span className="input-icon">👥</span>

                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                        <option key={number} value={number}>
                          {number} {number === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>ROOMS</label>

                  <div className="input-wrapper">
                    <span className="input-icon">🛏</span>

                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                    >
                      {Array.from(
                        {
                          length: Math.min(Number(hotel.rooms) || 1, 8),
                        },
                        (_, index) => index + 1,
                      ).map((number) => (
                        <option key={number} value={number}>
                          {number} {number === 1 ? "Room" : "Rooms"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* PRICE SUMMARY */}
            <div className="price-summary">
              <div className="summary-heading">
                <h3>Price summary</h3>
              </div>

              <div className="price-row">
                <span>
                  ETB {pricePerNight.toLocaleString()} × {nights || 0}{" "}
                  {nights === 1 ? "night" : "nights"}
                </span>

                <strong>ETB {(pricePerNight * nights).toLocaleString()}</strong>
              </div>

              <div className="price-row">
                <span>
                  {rooms} {rooms === 1 ? "room" : "rooms"}
                </span>

                <strong>ETB {totalPrice.toLocaleString()}</strong>
              </div>

              <div className="summary-line"></div>

              <div className="total-row">
                <div>
                  <span>Total</span>

                  <small>Includes your selected stay</small>
                </div>

                <strong>ETB {totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="confirm-booking-button"
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <>
                  <span className="button-loader"></span>
                  Booking...
                </>
              ) : (
                <>
                  Confirm booking
                  <span>→</span>
                </>
              )}
            </button>

            <div className="booking-security">
              🔒
              <p>Your reservation is securely processed.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Booking;
