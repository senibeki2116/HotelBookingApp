import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./Booking.css";

const API_URL = "http://localhost:5000";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

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

  const today = getToday();

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/hotels/${id}`);

        setHotel(response.data);
      } catch (err) {
        console.error("HOTEL FETCH ERROR:", err.response?.data || err.message);

        setError("Unable to load hotel information.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const pricePerNight = Number(hotel?.price) || 0;
  const selectedRooms = Number(rooms);
  const totalPrice = pricePerNight * nights * selectedRooms;
  const availableRooms = Number(hotel?.rooms) || 0;

  const getImageUrl = (image) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
    }

    if (image.startsWith("http")) return image;

    if (image.startsWith("/uploads/")) {
      return `${API_URL}${image}`;
    }

    if (image.startsWith("uploads/")) {
      return `${API_URL}/${image}`;
    }

    return `${API_URL}/uploads/${image}`;
  };

  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleBooking = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select your check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setError("Check-in date cannot be in the past.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (nights < 1) {
      setError("Your stay must be at least one night.");
      return;
    }

    if (!Number.isInteger(Number(guests)) || Number(guests) < 1) {
      setError("Please select a valid number of guests.");
      return;
    }

    if (!Number.isInteger(selectedRooms) || selectedRooms < 1) {
      setError("Please select a valid number of rooms.");
      return;
    }

    if (selectedRooms > availableRooms) {
      setError(`Only ${availableRooms} rooms are available.`);
      return;
    }

    if (pricePerNight <= 0) {
      setError("This hotel does not have a valid room price.");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = {
        hotelId: id,
        checkIn,
        checkOut,
        guests: Number(guests),
        rooms: selectedRooms,
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

      const bookingId = response.data?.booking?._id;

      if (!bookingId) {
        throw new Error(
          "The booking was created, but the server did not return its ID.",
        );
      }

      navigate(`/booking-confirmation/${bookingId}`);
    } catch (err) {
      console.error("BOOKING ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete your booking.",
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
              onError={(event) => {
                event.currentTarget.src =
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
                <strong>{availableRooms} rooms</strong>
              </div>
            </div>

            <div className="hotel-divider"></div>

            <div className="nightly-price">
              <small>Price per night</small>

              <div>
                <strong>ETB {formatPrice(pricePerNight)}</strong>
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
                      min={today}
                      required
                      onChange={(event) => {
                        setCheckIn(event.target.value);

                        if (checkOut && event.target.value >= checkOut) {
                          setCheckOut("");
                        }
                      }}
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
                      min={checkIn || today}
                      required
                      onChange={(event) => setCheckOut(event.target.value)}
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
                      onChange={(event) => setGuests(event.target.value)}
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
                      onChange={(event) => setRooms(event.target.value)}
                    >
                      {Array.from(
                        {
                          length: Math.min(availableRooms, 8),
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
                <span>Price per room / night</span>
                <strong>ETB {formatPrice(pricePerNight)}</strong>
              </div>

              <div className="price-row">
                <span>
                  {nights} {nights === 1 ? "night" : "nights"}
                  {" × "}
                  {selectedRooms} {selectedRooms === 1 ? "room" : "rooms"}
                </span>

                <strong>ETB {formatPrice(totalPrice)}</strong>
              </div>

              <div className="summary-line"></div>

              <div className="total-row">
                <div>
                  <span>Total</span>
                  <small>Estimated reservation amount</small>
                </div>

                <strong>ETB {formatPrice(totalPrice)}</strong>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="confirm-booking-button"
              disabled={
                bookingLoading || availableRooms < 1 || pricePerNight <= 0
              }
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
              <p>
                Your reservation details are securely submitted. Payment is
                handled separately at checkout.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Booking;
