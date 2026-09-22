import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminBookings.css";

const HotelAdminBookings = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // Get Hotel
  // ==========================
  const fetchHotel = async () => {
    try {
      const response = await API.get("/hotels/my-hotel");

      setHotel(response.data);
    } catch (error) {
      console.error("GET HOTEL ERROR:", error);

      setError(
        error.response?.data?.message || "Unable to load hotel information.",
      );
    }
  };

  // ==========================
  // Get Bookings
  // ==========================
  const fetchBookings = async () => {
    try {
      setError("");

      const response = await API.get("/bookings/my-hotel");

      setBookings(
        Array.isArray(response.data)
          ? response.data
          : response.data.bookings || [],
      );
    } catch (error) {
      console.error("HOTEL ADMIN BOOKINGS ERROR:", error);

      setError(error.response?.data?.message || "Unable to load bookings.");
    }
  };

  // ==========================
  // Initial Load
  // ==========================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([fetchHotel(), fetchBookings()]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ==========================
  // Refresh
  // ==========================
  const handleRefresh = async () => {
    setRefreshing(true);

    await Promise.all([fetchHotel(), fetchBookings()]);

    setRefreshing(false);
  };

  // ==========================
  // Logout
  // ==========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================
  // Date Format
  // ==========================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================
  // Status
  // ==========================
  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // ==========================
  // Statistics
  // ==========================
  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "confirmed",
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "cancelled",
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status?.toLowerCase() === "pending",
  ).length;

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="hotel-bookings-loading">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="hotel-admin-layout">
      {/* ==========================
          SIDEBAR
      ========================== */}
      <aside className="hotel-admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🏨</div>

          <div>
            <h2>Hotel Admin</h2>
            <span>Management Panel</span>
          </div>
        </div>

        <div className="sidebar-menu">
          {/* Dashboard */}
          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/hotel-dashboard")}
          >
            <span className="sidebar-icon">🏠</span>

            <span>Dashboard</span>
          </button>

          {/* Bookings */}
          <button
            className="sidebar-item active"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <span className="sidebar-icon">📅</span>

            <span>Bookings</span>
          </button>

          {/* View Website */}
          <button className="sidebar-item" onClick={() => navigate("/")}>
            <span className="sidebar-icon">🌐</span>

            <span>View Website</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          {/* Logout */}
          <button className="sidebar-item logout-item" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==========================
          MAIN CONTENT
      ========================== */}
      <main className="hotel-admin-main">
        {/* Header */}
        <header className="hotel-admin-header">
          <div>
            <h1>Bookings</h1>

            <p>
              Manage bookings for <strong>{hotel?.name || "your hotel"}</strong>
            </p>
          </div>

          <div className="admin-welcome">
            <span>Welcome,</span>

            <strong>{hotel?.hotelAdmin?.name || "Hotel Admin"} 👋</strong>
          </div>
        </header>

        {/* ==========================
            ERROR
        ========================== */}
        {error && <div className="booking-error">⚠️ {error}</div>}

        {/* ==========================
            STATISTICS
        ========================== */}
        <section className="booking-stats">
          <div className="booking-stat-card">
            <div className="booking-stat-icon">📊</div>

            <div>
              <span>Total Bookings</span>

              <strong>{totalBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="booking-stat-icon">✅</div>

            <div>
              <span>Confirmed</span>

              <strong>{confirmedBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="booking-stat-icon">⏳</div>

            <div>
              <span>Pending</span>

              <strong>{pendingBookings}</strong>
            </div>
          </div>

          <div className="booking-stat-card">
            <div className="booking-stat-icon">❌</div>

            <div>
              <span>Cancelled</span>

              <strong>{cancelledBookings}</strong>
            </div>
          </div>
        </section>

        {/* ==========================
            BOOKINGS SECTION
        ========================== */}
        <section className="bookings-section">
          <div className="bookings-section-header">
            <div>
              <h2>Hotel Bookings</h2>

              <p>All bookings made for your hotel.</p>
            </div>

            <button
              className="refresh-bookings-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {/* ==========================
              EMPTY STATE
          ========================== */}
          {bookings.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📅</div>

              <h3>No bookings yet</h3>

              <p>There are currently no bookings for your hotel.</p>
            </div>
          ) : (
            /* ==========================
               BOOKINGS TABLE
            ========================== */
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Email</th>
                    <th>Hotel</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Guests</th>
                    <th>Rooms</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      {/* Guest */}
                      <td>
                        <div className="guest-info">
                          <div className="guest-avatar">
                            {(booking.user?.name || "G")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{booking.user?.name || "Guest"}</strong>
                        </div>
                      </td>

                      {/* Email */}
                      <td>{booking.user?.email || "-"}</td>

                      {/* Hotel */}
                      <td>{booking.hotel?.name || hotel?.name || "-"}</td>

                      {/* Check In */}
                      <td>{formatDate(booking.checkIn)}</td>

                      {/* Check Out */}
                      <td>{formatDate(booking.checkOut)}</td>

                      {/* Guests */}
                      <td>{booking.guests || 0}</td>

                      {/* Rooms */}
                      <td>{booking.rooms || 0}</td>

                      {/* Amount */}
                      <td>
                        <strong>
                          ${Number(booking.totalPrice || 0).toFixed(2)}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`booking-status ${getStatusClass(
                            booking.status,
                          )}`}
                        >
                          {booking.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HotelAdminBookings;
