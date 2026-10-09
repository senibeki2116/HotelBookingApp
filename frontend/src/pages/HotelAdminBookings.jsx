import React, { useCallback, useEffect, useMemo, useState } from "react";
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

  const [activeTab, setActiveTab] = useState("Check-ins");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("list");

  // ==========================================
  // FETCH HOTEL
  // ==========================================

  const fetchHotel = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        setError("You are not logged in. Please log in again.");
        return;
      }

      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

      const response = await API.get("/hotels/my-hotel", {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      setHotel(response.data);
      setError("");
    } catch (err) {
      console.error("GET HOTEL ERROR:", err.response?.data || err);

      setError(
        err.response?.data?.message || "Unable to load hotel information.",
      );
    }
  }, []);

  // ==========================================
  // FETCH BOOKINGS
  // ==========================================

  const fetchBookings = useCallback(async () => {
    try {
      const response = await API.get("/bookings/my-hotel");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.bookings || [];

      setBookings(data);
    } catch (err) {
      console.error("HOTEL ADMIN BOOKINGS ERROR:", err);
      setError(err.response?.data?.message || "Unable to load bookings.");
    }
  }, []);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHotel(), fetchBookings()]);

      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchHotel, fetchBookings]);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await Promise.all([fetchHotel(), fetchBookings()]);
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatLongDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const changeDate = (amount) => {
    setSelectedDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + amount);
      return next;
    });
  };

  const isSameDay = (first, second) => {
    if (!first || !second) return false;

    const a = new Date(first);
    const b = new Date(second);

    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
      return false;
    }

    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const getStatusClass = (status) =>
    String(status || "unknown")
      .toLowerCase()
      .replace(/\s+/g, "-");

  const getGuestName = (booking) =>
    booking.user?.name || booking.guestName || booking.customerName || "Guest";

  const getGuestEmail = (booking) =>
    booking.user?.email || booking.guestEmail || booking.customerEmail || "-";

  const getCheckIn = (booking) =>
    booking.checkIn || booking.checkin || booking.check_in;

  const getCheckOut = (booking) =>
    booking.checkOut || booking.checkout || booking.check_out;

  const getAmount = (booking) =>
    Number(booking.totalPrice ?? booking.totalAmount ?? booking.price ?? 0);

  // ==========================================
  // STATISTICS
  // ==========================================

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

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const guestName = getGuestName(booking).toLowerCase();
      const guestEmail = getGuestEmail(booking).toLowerCase();
      const hotelName = (
        booking.hotel?.name ||
        hotel?.name ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        guestName.includes(query) ||
        guestEmail.includes(query) ||
        hotelName.includes(query) ||
        String(booking._id || "")
          .toLowerCase()
          .includes(query);

      let matchesTab = true;

      if (activeTab === "Check-ins") {
        matchesTab = isSameDay(getCheckIn(booking), selectedDate);
      } else if (activeTab === "Check-outs") {
        matchesTab = isSameDay(getCheckOut(booking), selectedDate);
      } else if (activeTab === "Stay-overs") {
        const checkIn = new Date(getCheckIn(booking));
        const checkOut = new Date(getCheckOut(booking));

        matchesTab =
          !Number.isNaN(checkIn.getTime()) &&
          !Number.isNaN(checkOut.getTime()) &&
          checkIn < selectedDate &&
          checkOut > selectedDate;
      }

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchTerm, activeTab, selectedDate, hotel]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="hotel-bookings-loading">
        <div className="loading-spinner" />
        <p>Loading bookings...</p>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="hotel-admin-layout">
      {/* SIDEBAR */}
      <aside className="hotel-admin-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <div>
            <h2>STAYORA</h2>
            <span>PROPERTY MANAGEMENT</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className="sidebar-item"
            onClick={() => navigate("/admin/hotel-dashboard")}
          >
            <span className="sidebar-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="sidebar-item active"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <span className="sidebar-icon">▣</span>
            <span>Reservations</span>
          </button>

          <button className="sidebar-item" onClick={() => navigate("/")}>
            <span className="sidebar-icon">🌐</span>
            <span>View Website</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-item logout-item" onClick={handleLogout}>
            <span className="sidebar-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hotel-admin-main">
        {/* HEADER */}
        <header className="hotel-admin-header">
          <div className="header-title">
            <span className="header-eyebrow">HOTEL MANAGEMENT</span>
            <h1>Reservations</h1>
            <p>
              Manage bookings for <strong>{hotel?.name || "your hotel"}</strong>
            </p>
          </div>

          <div className="admin-welcome">
            <div className="welcome-avatar">👋</div>

            <div className="welcome-text">
              <span>Welcome back,</span>
              <strong>{hotel?.hotelAdmin?.name || "Hotel Admin"}</strong>
              <small>Hotel Administrator</small>
            </div>
          </div>
        </header>

        {error && (
          <div className="booking-error" role="alert">
            ⚠️ {error}
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
              style={{
                float: "right",
                border: 0,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* RESERVATION WORKSPACE */}
        <section className="reservation-workspace">
          {/* TABS */}
          <div className="reservation-topbar">
            <div className="reservation-tabs">
              {["Check-outs", "Stay-overs", "Check-ins"].map((tab) => (
                <button
                  key={tab}
                  className={`reservation-tab ${
                    activeTab === tab ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              className="create-reservation-btn"
              onClick={() => navigate("/admin/hotel-dashboard")}
              title="Open your hotel dashboard to manage your property"
            >
              + Hotel Dashboard
            </button>
          </div>

          {/* TOOLBAR */}
          <div className="reservation-toolbar">
            <div className="reservation-heading">
              <h2>{activeTab}</h2>
              <p>
                {filteredBookings.length} reservation
                {filteredBookings.length === 1 ? "" : "s"} for{" "}
                {formatLongDate(selectedDate)}
              </p>
            </div>

            <div className="reservation-date-picker">
              <button onClick={() => changeDate(-1)} aria-label="Previous day">
                ‹
              </button>

              <div className="reservation-today">
                <strong>
                  {isSameDay(selectedDate, new Date())
                    ? "Today"
                    : selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                </strong>
                <span>{formatLongDate(selectedDate)}</span>
              </div>

              <button onClick={() => changeDate(1)} aria-label="Next day">
                ›
              </button>

              <input
                type="date"
                aria-label="Choose reservation date"
                value={[
                  selectedDate.getFullYear(),
                  String(selectedDate.getMonth() + 1).padStart(2, "0"),
                  String(selectedDate.getDate()).padStart(2, "0"),
                ].join("-")}
                onChange={(event) => {
                  if (!event.target.value) return;

                  const [year, month, day] = event.target.value
                    .split("-")
                    .map(Number);

                  setSelectedDate(new Date(year, month - 1, day));
                }}
              />
            </div>

            <div className="reservation-view-actions">
              <span>#{totalBookings} Total</span>

              <button
                className={viewMode === "grid" ? "selected" : ""}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                title="Grid view"
              >
                ▦
              </button>

              <button
                className={viewMode === "list" ? "selected" : ""}
                onClick={() => setViewMode("list")}
                aria-label="List view"
                title="List view"
              >
                ☷
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh reservations"
                title="Refresh reservations"
              >
                ↻
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="reservation-search-row">
            <div className="reservation-search">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Search by name, email, hotel, or booking ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search reservations"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="reservation-updated">
              <span className="online-dot" />
              {refreshing ? "Updating reservations..." : "Reservation list"}
            </div>
          </div>

          {/* BOOKINGS TABLE */}
          {filteredBookings.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📅</div>

              <h3>
                {searchTerm
                  ? "No matching reservations"
                  : "No reservations for this date"}
              </h3>

              <p>
                {searchTerm
                  ? "Try another guest name, email, or booking ID."
                  : "Choose another date or check another reservation tab."}
              </p>

              {(searchTerm ||
                activeTab !== "Check-ins" ||
                !isSameDay(selectedDate, new Date())) && (
                <button
                  className="reservation-reset-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("Check-ins");
                    setSelectedDate(new Date());
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
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
                  {filteredBookings.map((booking, index) => (
                    <tr key={booking._id || booking.id || index}>
                      <td>
                        <div className="guest-info">
                          <div className="guest-avatar">
                            {getGuestName(booking).charAt(0).toUpperCase()}
                          </div>

                          <div className="reservation-guest-details">
                            <strong>{getGuestName(booking)}</strong>
                            <span>
                              ID:{" "}
                              {String(booking._id || booking.id || "—").slice(
                                -8,
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{getGuestEmail(booking)}</td>

                      <td>{booking.hotel?.name || hotel?.name || "-"}</td>

                      <td>{formatDate(getCheckIn(booking))}</td>

                      <td>{formatDate(getCheckOut(booking))}</td>

                      <td>{booking.guests ?? 1}</td>

                      <td>{booking.rooms ?? 1}</td>

                      <td>
                        <strong className="reservation-amount">
                          ${getAmount(booking).toFixed(2)}
                        </strong>
                      </td>

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
