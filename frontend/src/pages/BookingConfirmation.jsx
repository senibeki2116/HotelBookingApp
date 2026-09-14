import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./BookingConfirmation.css";

const API_URL = "http://localhost:5000";

function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data?.booking || response.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your booking confirmation.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate, token]);

  if (loading) {
    return (
      <main className="booking-confirmation-page">
        <p>Loading your confirmation...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="booking-confirmation-page">
        <section className="booking-confirmation-card">
          <h1>Confirmation unavailable</h1>
          <p>{error || "We couldn't find this booking."}</p>
          <div className="booking-confirmation-actions">
            <Link to="/my-bookings" className="booking-confirmation-primary">
              View my bookings
            </Link>
            <Link to="/hotels" className="booking-confirmation-secondary">
              Browse hotels
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hotel = typeof booking.hotel === "object" ? booking.hotel : null;
  const hotelName = hotel?.name || "Hotel reservation";
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "Not available";

  return (
    <main className="booking-confirmation-page">
      <section className="booking-confirmation-card">
        <div className="booking-confirmation-icon" aria-hidden="true">
          ✓
        </div>
        <span className="booking-confirmation-eyebrow">
          RESERVATION CONFIRMED
        </span>
        <h1>Your stay is booked.</h1>
        <p>We have successfully confirmed your reservation at {hotelName}.</p>

        <dl className="booking-confirmation-details">
          <div>
            <dt>Check-in</dt>
            <dd>{formatDate(booking.checkIn)}</dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>{formatDate(booking.checkOut)}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>{booking.guests || 1}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{booking.status || "confirmed"}</dd>
          </div>
        </dl>

        <p className="booking-confirmation-id">
          Booking ID: <strong>{booking._id || id}</strong>
        </p>

        <div className="booking-confirmation-actions">
          <Link to="/my-bookings" className="booking-confirmation-primary">
            View my bookings
          </Link>
          <Link to="/hotels" className="booking-confirmation-secondary">
            Browse more hotels
          </Link>
        </div>
      </section>
    </main>
  );
}

export default BookingConfirmation;
