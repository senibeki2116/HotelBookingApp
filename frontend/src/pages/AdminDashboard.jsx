import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const adminName = user?.name || "Admin";

  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotelAdmins, setHotelAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================================
     LOAD REAL DASHBOARD DATA
  ================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [hotelsRes, bookingsRes, usersRes, adminsRes] = await Promise.all(
          [
            API.get("/hotels"),
            API.get("/bookings"),
            API.get("/users/hotel-admins"),
            API.get("/users/hotel-admins"),
          ],
        );

        const hotelData = Array.isArray(hotelsRes.data)
          ? hotelsRes.data
          : hotelsRes.data?.hotels || [];

        const bookingData = Array.isArray(bookingsRes.data)
          ? bookingsRes.data
          : bookingsRes.data?.bookings || [];

        const adminData = Array.isArray(adminsRes.data)
          ? adminsRes.data
          : adminsRes.data?.hotelAdmins || [];

        setHotels(hotelData);
        setBookings(bookingData);
        setHotelAdmins(adminData);

        /*
          We don't currently have a dedicated admin users endpoint
          in the information available here.

          Count regular users from the hotel-admin response if your
          backend returns them, otherwise use 0.
        */
        try {
          const usersRes = await API.get("/users");

          const userData = Array.isArray(usersRes.data)
            ? usersRes.data
            : usersRes.data?.users || [];

          setUsers(userData);
        } catch {
          setUsers([]);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* ================================
     CALCULATIONS
  ================================= */

  const totalHotels = hotels.length;
  const totalBookings = bookings.length;

  const totalUsers = users.filter((item) => item.role === "user").length;

  const totalHotelAdmins = hotelAdmins.length;

  const confirmedBookings = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "confirmed",
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "cancelled",
  ).length;

  const totalRevenue = bookings
    .filter(
      (booking) => String(booking.status || "").toLowerCase() !== "cancelled",
    )
    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  /* ================================
     HELPERS
  ================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatMoney = (amount) => {
    return `$${Number(amount || 0).toLocaleString()}`;
  };

  const getGuestName = (booking) => {
    if (booking.user?.name) return booking.user.name;

    if (booking.user?.email) return booking.user.email;

    return "Guest";
  };

  const getHotelName = (booking) => {
    if (booking.hotel?.name) return booking.hotel.name;

    return "Hotel";
  };

  const getInitial = (name) => {
    return String(name || "G")
      .charAt(0)
      .toUpperCase();
  };

  const getStatusClass = (status) => {
    const value = String(status || "confirmed").toLowerCase();

    if (value === "cancelled") {
      return "cancelled";
    }

    return "confirmed";
  };

  /* ================================
     LOGOUT
  ================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ================================
     REFRESH
  ================================= */

  const refreshDashboard = async () => {
    window.location.reload();
  };

  return (
    <div className="super-admin-layout">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <span>◆</span>
          </div>

          <div>
            <h2>
              Stay<span>Hub</span>
            </h2>

            <small>HOTEL MANAGEMENT</small>
          </div>
        </div>

        {/* ADMIN PROFILE */}

        <div className="sidebar-profile">
          <div className="sidebar-avatar">{getInitial(adminName)}</div>

          <div className="sidebar-profile-text">
            <strong>{adminName}</strong>
            <span>Super Administrator</span>
          </div>

          <div className="online-dot"></div>
        </div>

        {/* NAVIGATION */}

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>

          <button
            className="nav-item active"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span className="nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/admin/manage-hotels")}
          >
            <span className="nav-icon">▣</span>
            <span>Hotels</span>
            <span className="nav-count">{totalHotels}</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            <span className="nav-icon">▤</span>
            <span>Bookings</span>
            <span className="nav-count">{totalBookings}</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/admin/users")}>
            <span className="nav-icon">◉</span>
            <span>Users</span>
          </button>

          <div className="nav-section-title">MANAGEMENT</div>

          <button
            className="nav-item"
            onClick={() => navigate("/admin/hotel-admins")}
          >
            <span className="nav-icon">♙</span>
            <span>Hotel Admins</span>
            <span className="nav-count">{totalHotelAdmins}</span>
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/admin/reports")}
          >
            <span className="nav-icon">◫</span>
            <span>Reports</span>
          </button>
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">
          <button className="website-btn" onClick={() => navigate("/")}>
            <span>↗</span>
            View Website
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            <span>⇥</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="admin-main">
        {/* TOP BAR */}

        <header className="admin-topbar">
          <div className="topbar-title">
            <div className="breadcrumb">
              Administration
              <span>/</span>
              Dashboard
            </div>

            <h1>Dashboard</h1>
          </div>

          <div className="topbar-right">
            <button
              className="refresh-btn"
              onClick={refreshDashboard}
              title="Refresh dashboard"
            >
              ↻
            </button>

            <div className="topbar-divider"></div>

            <div className="topbar-user">
              <div className="topbar-avatar">{getInitial(adminName)}</div>

              <div>
                <strong>{adminName}</strong>
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =================================================
            WELCOME AREA
        ================================================== */}

        <section className="welcome-banner">
          <div className="welcome-content">
            <div className="welcome-label">ADMINISTRATION OVERVIEW</div>

            <h2>Good day, {adminName}.</h2>

            <p>
              Manage your hotels, customers, reservations and hotel
              administrators from one central workspace.
            </p>

            <div className="welcome-actions">
              <button
                className="welcome-primary"
                onClick={() => navigate("/admin/manage-hotels")}
              >
                Manage Hotels
                <span>→</span>
              </button>

              <button
                className="welcome-secondary"
                onClick={() => navigate("/admin/bookings")}
              >
                View Bookings
              </button>
            </div>
          </div>

          <div className="welcome-visual">
            <div className="visual-circle circle-one"></div>
            <div className="visual-circle circle-two"></div>

            <div className="hotel-building">
              <div className="building-roof"></div>

              <div className="building-body">
                <div className="building-window"></div>
                <div className="building-window"></div>
                <div className="building-window"></div>

                <div className="building-door"></div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">PLATFORM OVERVIEW</span>

              <h2>Business Summary</h2>

              <p>Current activity across your hotel platform.</p>
            </div>

            <div className="live-status">
              <span></span>
              Live data
            </div>
          </div>

          <div className="stats-grid">
            {/* HOTELS */}

            <div
              className="stat-card"
              onClick={() => navigate("/admin/manage-hotels")}
            >
              <div className="stat-header">
                <div className="stat-icon blue">▣</div>

                <span className="stat-arrow">→</span>
              </div>

              <div className="stat-number">{loading ? "—" : totalHotels}</div>

              <div className="stat-name">Total Hotels</div>

              <div className="stat-description">Properties on platform</div>
            </div>

            {/* BOOKINGS */}

            <div
              className="stat-card"
              onClick={() => navigate("/admin/bookings")}
            >
              <div className="stat-header">
                <div className="stat-icon purple">▤</div>

                <span className="stat-arrow">→</span>
              </div>

              <div className="stat-number">{loading ? "—" : totalBookings}</div>

              <div className="stat-name">Total Bookings</div>

              <div className="stat-description">All reservations</div>
            </div>

            {/* USERS */}

            <div className="stat-card" onClick={() => navigate("/admin/users")}>
              <div className="stat-header">
                <div className="stat-icon green">◉</div>

                <span className="stat-arrow">→</span>
              </div>

              <div className="stat-number">{loading ? "—" : totalUsers}</div>

              <div className="stat-name">Customers</div>

              <div className="stat-description">Registered users</div>
            </div>

            {/* REVENUE */}

            <div
              className="stat-card"
              onClick={() => navigate("/admin/reports")}
            >
              <div className="stat-header">
                <div className="stat-icon orange">$</div>

                <span className="stat-arrow">→</span>
              </div>

              <div className="stat-number revenue">
                {loading ? "—" : formatMoney(totalRevenue)}
              </div>

              <div className="stat-name">Total Revenue</div>

              <div className="stat-description">From confirmed bookings</div>
            </div>
          </div>
        </section>

        {/* =================================================
            SECONDARY STATS
        ================================================== */}

        <section className="secondary-stats">
          <div className="mini-stat">
            <div className="mini-icon">✓</div>

            <div>
              <strong>{loading ? "—" : confirmedBookings}</strong>

              <span>Confirmed bookings</span>
            </div>
          </div>

          <div className="mini-stat">
            <div className="mini-icon cancelled-icon">×</div>

            <div>
              <strong>{loading ? "—" : cancelledBookings}</strong>

              <span>Cancelled bookings</span>
            </div>
          </div>

          <div className="mini-stat">
            <div className="mini-icon admin-icon">♙</div>

            <div>
              <strong>{loading ? "—" : totalHotelAdmins}</strong>

              <span>Hotel administrators</span>
            </div>
          </div>
        </section>

        {/* =================================================
            MANAGEMENT
        ================================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">MANAGEMENT</span>

              <h2>Quick Actions</h2>

              <p>Frequently used administration tools.</p>
            </div>
          </div>

          <div className="management-grid">
            <div className="management-card">
              <div className="management-top">
                <div className="management-icon blue">▣</div>

                <span>01</span>
              </div>

              <h3>Hotels</h3>

              <p>
                Create new hotels, update property information and manage
                available rooms.
              </p>

              <button onClick={() => navigate("/admin/manage-hotels")}>
                Manage Hotels
                <span>→</span>
              </button>
            </div>

            <div className="management-card">
              <div className="management-top">
                <div className="management-icon purple">▤</div>

                <span>02</span>
              </div>

              <h3>Bookings</h3>

              <p>
                Review customer reservations and monitor booking activity across
                your properties.
              </p>

              <button onClick={() => navigate("/admin/bookings")}>
                View Bookings
                <span>→</span>
              </button>
            </div>

            <div className="management-card">
              <div className="management-top">
                <div className="management-icon green">◉</div>

                <span>03</span>
              </div>

              <h3>Customers</h3>

              <p>
                View registered customers and manage customer accounts on your
                platform.
              </p>

              <button onClick={() => navigate("/admin/users")}>
                Manage Users
                <span>→</span>
              </button>
            </div>

            <div className="management-card">
              <div className="management-top">
                <div className="management-icon orange">♙</div>

                <span>04</span>
              </div>

              <h3>Hotel Admins</h3>

              <p>
                Create hotel administrator accounts and assign them to
                individual properties.
              </p>

              <button onClick={() => navigate("/admin/hotel-admins")}>
                Manage Admins
                <span>→</span>
              </button>
            </div>

            <div className="management-card">
              <div className="management-top">
                <div className="management-icon red">◫</div>

                <span>05</span>
              </div>

              <h3>Reports</h3>

              <p>Analyze hotel activity, bookings and financial performance.</p>

              <button onClick={() => navigate("/admin/reports")}>
                Open Reports
                <span>→</span>
              </button>
            </div>

            <div className="management-card">
              <div className="management-top">
                <div className="management-icon cyan">+</div>

                <span>06</span>
              </div>

              <h3>Add Hotel</h3>

              <p>
                Register a new property and make it available on the booking
                platform.
              </p>

              <button onClick={() => navigate("/admin/add-hotel")}>
                Add New Hotel
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            RECENT BOOKINGS
        ================================================== */}

        <section className="dashboard-section recent-section">
          <div className="section-heading">
            <div>
              <span className="section-label">RESERVATIONS</span>

              <h2>Recent Bookings</h2>

              <p>Latest reservations received by the platform.</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => navigate("/admin/bookings")}
            >
              View all
              <span>→</span>
            </button>
          </div>

          <div className="booking-table-card">
            {loading ? (
              <div className="table-loading">
                <div className="loading-spinner"></div>
                Loading bookings...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="empty-bookings">
                <div className="empty-icon">▤</div>

                <h3>No bookings yet</h3>

                <p>
                  Customer reservations will appear here once bookings are
                  created.
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="booking-table">
                  <thead>
                    <tr>
                      <th>GUEST</th>
                      <th>HOTEL</th>
                      <th>CHECK-IN</th>
                      <th>CHECK-OUT</th>
                      <th>GUESTS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentBookings.map((booking) => {
                      const guestName = getGuestName(booking);

                      return (
                        <tr key={booking._id}>
                          <td>
                            <div className="guest-cell">
                              <div className="guest-avatar">
                                {getInitial(guestName)}
                              </div>

                              <div>
                                <strong>{guestName}</strong>

                                <span>{booking.user?.email || "Customer"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <strong>{getHotelName(booking)}</strong>

                            <span className="table-secondary">
                              {booking.hotel?.location || "Hotel"}
                            </span>
                          </td>

                          <td>{formatDate(booking.checkIn)}</td>

                          <td>{formatDate(booking.checkOut)}</td>

                          <td>{booking.guests || 1}</td>

                          <td>
                            <strong>{formatMoney(booking.totalPrice)}</strong>
                          </td>

                          <td>
                            <span
                              className={`booking-status ${getStatusClass(
                                booking.status,
                              )}`}
                            >
                              <i></i>

                              {String(booking.status || "confirmed")
                                .charAt(0)
                                .toUpperCase() +
                                String(booking.status || "confirmed").slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================== */}

        <footer className="admin-footer">
          <div className="footer-brand">
            <strong>StayHub</strong>

            <span>Hotel Management System</span>
          </div>

          <div>© 2026 StayHub · Administration</div>
        </footer>
      </main>
    </div>
  );
}

export default AdminDashboard;
