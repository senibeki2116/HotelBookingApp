import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Booking.css";

function Booking() {
  const { id, hotelId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const selectedHotelId = id || hotelId;

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1,
  });

  useEffect(() => {
    fetchHotel();
  }, [selectedHotelId]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/hotels/${selectedHotelId}`,
      );

      setHotel(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load hotel information.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) {
      return 0;
    }

    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);

    const difference = end - start;
    const nights = Math.ceil(difference / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();

  const pricePerNight = Number(hotel?.price || hotel?.pricePerNight || 0);

  const totalPrice =
    nights > 0
      ? pricePerNight * nights * Number(formData.rooms)
      : pricePerNight * Number(formData.rooms);

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!formData.checkIn || !formData.checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }

    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (Number(formData.guests) < 1) {
      setError("At least one guest is required.");
      return;
    }

    if (Number(formData.rooms) < 1) {
      setError("At least one room is required.");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        hotelId: selectedHotelId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: Number(formData.guests),
        rooms: Number(formData.rooms),
        totalPrice: totalPrice,
      };

      await axios.post("http://localhost:5000/api/bookings", bookingData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Your booking has been created successfully!");

      setTimeout(() => {
        navigate("/bookings");
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-loading">
        <div className="spinner"></div>
        <p>Loading hotel information...</p>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="booking-error-page">
        <div className="error-box">
          <div className="error-icon">!</div>
          <h2>Hotel Not Found</h2>
          <p>{error}</p>

          <button onClick={() => navigate("/hotels")}>Back to Hotels</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* NAVBAR */}
      <nav className="booking-navbar">
        <div className="booking-logo">
          <Link to="/hotels">
            <span className="logo-icon">✦</span>
            StayLux
          </Link>
        </div>

        <div className="booking-nav-links">
          <Link to="/hotels">Hotels</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/">Home</Link>
        </div>

        <button className="nav-back-btn" onClick={() => navigate("/hotels")}>
          ← Back
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="booking-container">
        {/* PAGE HEADER */}
        <div className="booking-header">
          <div>
            <span className="booking-label">RESERVATION</span>
            <h1>Complete Your Booking</h1>
            <p>Reserve your room and get ready for a comfortable stay.</p>
          </div>

          <div className="secure-box">
            <span>🔒</span>
            <div>
              <strong>Secure Booking</strong>
              <small>Your information is protected</small>
            </div>
          </div>
        </div>

        <div className="booking-layout">
          {/* LEFT SIDE */}
          <section className="hotel-summary">
            <div className="hotel-image-wrapper">
              {hotel?.image ? (
                <img
                  src={
                    hotel.image.startsWith("http")
                      ? hotel.image
                      : `http://localhost:5000/${hotel.image}`
                  }
                  alt={hotel.name}
                />
              ) : hotel?.imageUrl ? (
                <img src={hotel.imageUrl} alt={hotel.name} />
              ) : (
                <div className="hotel-placeholder">🏨</div>
              )}

              <span className="popular-badge">★ Popular</span>
            </div>

            <div className="hotel-info">
              <div className="rating-row">
                <span className="stars">★★★★★</span>
                <span className="rating-text">Excellent hotel</span>
              </div>

              <h2>{hotel?.name || "Hotel"}</h2>

              <p className="location">
                📍 {hotel?.location || hotel?.city || "Ethiopia"}
              </p>

              <div className="hotel-features">
                <div>
                  <span>✓</span>
                  Free Wi-Fi
                </div>

                <div>
                  <span>✓</span>
                  Comfortable Rooms
                </div>

                <div>
                  <span>✓</span>
                  24/7 Support
                </div>

                <div>
                  <span>✓</span>
                  Best Price
                </div>
              </div>

              {hotel?.description && (
                <div className="hotel-description">
                  <h3>About this hotel</h3>
                  <p>{hotel.description}</p>
                </div>
              )}

              <button
                className="return-hotels"
                onClick={() => navigate("/hotels")}
              >
                ← Browse Other Hotels
              </button>
            </div>
          </section>

          {/* RIGHT SIDE - BOOKING FORM */}
          <section className="booking-card">
            <div className="card-header">
              <div>
                <span className="small-title">YOUR RESERVATION</span>

                <h2>Book Your Stay</h2>
              </div>

              <div className="price-display">
                <strong>${pricePerNight}</strong>
                <span>/ night</span>
              </div>
            </div>

            <form onSubmit={handleBooking}>
              {/* DATES */}
              <div className="form-section">
                <h3>📅 Select your dates</h3>

                <div className="date-grid">
                  <div className="input-group">
                    <label htmlFor="checkIn">Check In</label>

                    <input
                      id="checkIn"
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="checkOut">Check Out</label>

                    <input
                      id="checkOut"
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      min={
                        formData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="night-info">
                    ✓ {nights} night{nights > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* GUESTS */}
              <div className="form-section">
                <h3>👥 Guests & Rooms</h3>

                <div className="guest-grid">
                  <div className="input-group">
                    <label htmlFor="guests">Guests</label>

                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="7">7 Guests</option>
                      <option value="8">8 Guests</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label htmlFor="rooms">Rooms</label>

                    <select
                      id="rooms"
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                    >
                      <option value="1">1 Room</option>
                      <option value="2">2 Rooms</option>
                      <option value="3">3 Rooms</option>
                      <option value="4">4 Rooms</option>
                      <option value="5">5 Rooms</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="booking-alert error-alert">
                  <span>⚠</span>
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="booking-alert success-alert">
                  <span>✓</span>
                  {success}
                </div>
              )}

              {/* PRICE */}
              <div className="price-summary">
                <div className="price-line">
                  <span>
                    ${pricePerNight} × {nights || 1} night
                    {(nights || 1) > 1 ? "s" : ""}
                  </span>

                  <strong>${pricePerNight * (nights || 1)}</strong>
                </div>

                <div className="price-line">
                  <span>Rooms</span>

                  <strong>× {formData.rooms}</strong>
                </div>

                <div className="divider"></div>

                <div className="total-line">
                  <span>Total</span>

                  <strong>${totalPrice}</strong>
                </div>
              </div>

              {/* BOOK BUTTON */}
              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Booking
                    <span>→</span>
                  </>
                )}
              </button>

              <p className="booking-note">
                🔒 You won't be charged until your booking is confirmed.
              </p>
            </form>
          </section>
        </div>

        {/* BENEFITS */}
        <section className="booking-benefits">
          <div className="benefit">
            <span>🛡️</span>
            <div>
              <strong>Secure Reservation</strong>
              <p>Your booking information is safe.</p>
            </div>
          </div>

          <div className="benefit">
            <span>💰</span>
            <div>
              <strong>Best Price Guarantee</strong>
              <p>Get the best available hotel prices.</p>
            </div>
          </div>

          <div className="benefit">
            <span>📞</span>
            <div>
              <strong>24/7 Support</strong>
              <p>We're here whenever you need us.</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="booking-footer">
        <p>© 2026 StayLux Hotel Booking System</p>

        <div>
          <span>Secure</span>
          <span>•</span>
          <span>Reliable</span>
          <span>•</span>
          <span>Easy Booking</span>
        </div>
      </footer>
    </div>
  );
}

export default Booking;
