import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminBooking.css";

const AdminBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/bookings");

      console.log("Admin bookings:", response.data);

      setBookings(response.data);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="admin-bookings-page">
        <div className="booking-loading">
          <div className="booking-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings-page">
      {/* Header */}
      <div className="bookings-header">
        <div>
          <span className="booking-label">ADMIN PANEL</span>

          <h1>Booking Management</h1>

          <p>View and manage all hotel bookings.</p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/admin")}
        >
          ← Dashboard
        </button>
      </div>

      {/* Error */}
      {error && <div className="booking-error">{error}</div>}

      {/* Summary */}
      <div className="booking-summary">
        <div className="summary-card">
          <span className="summary-icon">📅</span>

          <div>
            <span>Total Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon">🏨</span>

          <div>
            <span>Hotel Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div className="bookings-container">
        <div className="bookings-title">
          <div>
            <h2>All Bookings</h2>
            <p>Recent booking activity</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div>📅</div>

            <h2>No Bookings Found</h2>

            <p>There are currently no bookings in the system.</p>
          </div>
        ) : (
          <div className="booking-table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>GUEST</th>
                  <th>HOTEL</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    {/* Guest */}
                    <td>
                      <div className="guest-info">
                        <div className="guest-avatar">
                          {booking.user?.name
                            ? booking.user.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <div>
                          <strong>
                            {booking.user?.name || "Unknown User"}
                          </strong>

                          <small>{booking.user?.email || "No email"}</small>
                        </div>
                      </div>
                    </td>

                    {/* Hotel */}
                    <td>
                      <div className="hotel-info">
                        {booking.hotel?.image && (
                          <img
                            src={booking.hotel.image}
                            alt={booking.hotel.name}
                          />
                        )}

                        <strong>
                          {booking.hotel?.name || "Unknown Hotel"}
                        </strong>
                      </div>
                    </td>

                    {/* Check in */}
                    <td>
                      {booking.checkIn
                        ? new Date(booking.checkIn).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Check out */}
                    <td>
                      {booking.checkOut
                        ? new Date(booking.checkOut).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`booking-status ${
                          booking.status || "pending"
                        }`}
                      >
                        ● {booking.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
