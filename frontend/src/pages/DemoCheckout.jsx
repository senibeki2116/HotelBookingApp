import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./DemoCheckout.css";

const API_URL = "http://localhost:5000";

const getToken = () =>
  localStorage.getItem("token") || localStorage.getItem("accessToken");

const getBookingsArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function DemoCheckout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = getToken();

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/api/bookings/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const bookings = getBookingsArray(response.data);
        const selectedBooking = bookings.find(
          (item) => String(item._id || item.id) === String(bookingId),
        );

        if (!selectedBooking) {
          setError("We couldn't find this booking. Please check My Bookings.");
          return;
        }

        setBooking(selectedBooking);
      } catch (err) {
        console.error(
          "FETCH BOOKING ERROR:",
          err.response?.data || err.message,
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your booking. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate, token]);

  const confirmPayment = async () => {
    if (!token || !booking) {
      setError("Please log in and select a valid booking.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/payments/confirm-demo/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Demo payment confirmation failed.",
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error("DEMO PAYMENT ERROR:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Payment confirmation failed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  const hotelName =
    booking?.hotel?.name || booking?.hotelName || "Stayora Hotel";

  const checkIn = booking?.checkIn
    ? new Date(booking.checkIn).toLocaleDateString()
    : "Not available";

  const checkOut = booking?.checkOut
    ? new Date(booking.checkOut).toLocaleDateString()
    : "Not available";

  const totalPrice = Number(booking?.totalPrice || 0);

  if (loading) {
    return (
      <div className="demo-checkout-page">
        <div className="demo-checkout-message">
          <div className="demo-spinner" />
          <h2>Preparing your checkout...</h2>
          <p>Please wait while we load your booking.</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="demo-checkout-page">
        <div className="demo-checkout-message">
          <h2>Booking unavailable</h2>
          <p>{error}</p>
          <button
            className="demo-secondary-button"
            onClick={() => navigate("/my-bookings")}
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="demo-checkout-page">
      <header className="demo-checkout-header">
        <button
          className="demo-brand"
          onClick={() => navigate("/")}
          aria-label="Go to Stayora homepage"
        >
          STAY<span>ORA</span>
        </button>

        <div className="demo-secure-label">
          <span>✓</span> Demo checkout
        </div>
      </header>

      <section className="demo-checkout-container">
        {success ? (
          <div className="demo-success-card">
            <div className="demo-success-icon">✓</div>
            <p className="demo-eyebrow">DEMO PAYMENT COMPLETE</p>
            <h1>Payment successful!</h1>
            <p>
              Your demo payment has been confirmed. No real money was
              transferred.
            </p>

            <div className="demo-success-details">
              <div>
                <span>Hotel</span>
                <strong>{hotelName}</strong>
              </div>
              <div>
                <span>Booking reference</span>
                <strong>{bookingId}</strong>
              </div>
              <div>
                <span>Demo amount</span>
                <strong>{totalPrice.toLocaleString()} ETB</strong>
              </div>
            </div>

            <button
              className="demo-primary-button"
              onClick={() => navigate("/my-bookings")}
            >
              Return to My Bookings
            </button>
          </div>
        ) : (
          <>
            <div className="demo-checkout-intro">
              <p className="demo-eyebrow">STAYORA CHECKOUT</p>
              <h1>Review your booking</h1>
              <p>
                Check your booking details before confirming the demo payment.
              </p>
            </div>

            <div className="demo-warning">
              <span className="demo-warning-icon">!</span>
              <div>
                <strong>DEMO PAYMENT — NO REAL MONEY</strong>
                <p>
                  This is a simulated checkout for testing. Do not enter card
                  numbers, bank details, or passwords.
                </p>
              </div>
            </div>

            <div className="demo-checkout-grid">
              <section className="demo-booking-card">
                <h2>Booking details</h2>

                <div className="demo-hotel-summary">
                  <div className="demo-hotel-icon">⌂</div>
                  <div>
                    <h3>{hotelName}</h3>
                    <p>
                      {booking?.hotel?.location ||
                        booking?.location ||
                        "Hotel reservation"}
                    </p>
                  </div>
                </div>

                <div className="demo-detail-row">
                  <span>Check-in</span>
                  <strong>{checkIn}</strong>
                </div>

                <div className="demo-detail-row">
                  <span>Check-out</span>
                  <strong>{checkOut}</strong>
                </div>

                <div className="demo-detail-row">
                  <span>Guests</span>
                  <strong>{booking?.guests ?? "—"}</strong>
                </div>

                <div className="demo-detail-row">
                  <span>Rooms</span>
                  <strong>{booking?.rooms ?? "—"}</strong>
                </div>

                <div className="demo-detail-row">
                  <span>Booking status</span>
                  <strong>{booking?.status || "Pending"}</strong>
                </div>
              </section>

              <section className="demo-payment-card">
                <h2>Payment summary</h2>

                <div className="demo-detail-row">
                  <span>Booking amount</span>
                  <strong>{totalPrice.toLocaleString()} ETB</strong>
                </div>

                <div className="demo-detail-row">
                  <span>Payment method</span>
                  <strong>Demo Payment</strong>
                </div>

                <div className="demo-total-row">
                  <span>Total</span>
                  <strong>{totalPrice.toLocaleString()} ETB</strong>
                </div>

                {error && <div className="demo-error-message">{error}</div>}

                <button
                  className="demo-primary-button"
                  onClick={confirmPayment}
                  disabled={paying || totalPrice <= 0}
                >
                  {paying ? "Confirming..." : "Confirm Demo Payment"}
                </button>

                <button
                  className="demo-cancel-button"
                  onClick={() => navigate("/my-bookings")}
                  disabled={paying}
                >
                  Cancel and return
                </button>

                <p className="demo-no-charge">
                  This action simulates payment only. No charge will be made.
                </p>
              </section>
            </div>
          </>
        )}
      </section>

      <footer className="demo-checkout-footer">
        © {new Date().getFullYear()} Stayora. Demo environment.
      </footer>
    </main>
  );
}

export default DemoCheckout;
