import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import fallbackImg from "../images/regImage.png";
import "./MyBookings.css";

const getBookingImageUrl = (image) => {
  if (!image || typeof image !== "string") return fallbackImg;

  if (image.startsWith("http")) return image;
  if (image.startsWith("/uploads/")) return `http://localhost:5000${image}`;
  if (image.startsWith("uploads/")) return `http://localhost:5000/${image}`;

  return `http://localhost:5000/uploads/${image}`;
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/bookings/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.log(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const deleteBooking = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBookings(bookings.filter((booking) => booking._id !== id));

      alert("Booking cancelled successfully!");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Failed to cancel booking.");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading bookings...</h2>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="page-header">
        <h1>📖 My Bookings</h1>
        <p>View and manage all your hotel reservations.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-bookings">
          <h2>No Bookings Found</h2>
          <p>You haven't booked any hotels yet.</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <img
              className="booking-image"
              src={getBookingImageUrl(booking.hotel.image)}
              alt={booking.hotel.name}
              onError={(e) => {
                e.currentTarget.src = fallbackImg;
              }}
            />

            <div className="booking-details">
              <h2>{booking.hotel.name}</h2>

              <p>
                📍 <strong>Location:</strong> {booking.hotel.location}
              </p>

              <p>
                📅 <strong>Check-In:</strong>{" "}
                {new Date(booking.checkIn).toLocaleDateString()}
              </p>

              <p>
                📅 <strong>Check-Out:</strong>{" "}
                {new Date(booking.checkOut).toLocaleDateString()}
              </p>

              <p>
                👥 <strong>Guests:</strong> {booking.guests}
              </p>

              <p>
                💰 <strong>Total Price:</strong> ${booking.totalPrice}
              </p>

              <p>
                📌 <strong>Status:</strong>{" "}
                <span
                  className={
                    booking.status === "confirmed"
                      ? "status confirmed"
                      : "status cancelled"
                  }
                >
                  {booking.status}
                </span>
              </p>

              <button
                className="cancel-btn"
                onClick={() => deleteBooking(booking._id)}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyBookings;
