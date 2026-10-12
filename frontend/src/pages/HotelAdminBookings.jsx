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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newBookings, setNewBookings] = useState([]);
  const knownBookingIds = React.useRef(null);

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

      const normalized = Array.isArray(data) ? data : [];
      const ids = normalized
        .map((item) => String(item._id || item.id || ""))
        .filter(Boolean);
      if (knownBookingIds.current === null) {
        knownBookingIds.current = new Set(ids);
      } else {
        const previous = knownBookingIds.current;
        const added = normalized.filter((item) => {
          const id = String(item._id || item.id || "");
          return id && !previous.has(id);
        });
        if (added.length)
          setNewBookings((current) => [...added, ...current].slice(0, 8));
        knownBookingIds.current = new Set(ids);
      }
      setBookings(normalized);
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

  // Poll for new bookings every 20 seconds while this page is open.
  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchBookings();
    }, 20000);
    return () => window.clearInterval(timer);
  }, [fetchBookings]);

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

  const toCalendarDay = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
  };

  const isSameDay = (first, second) => {
    const firstDay = toCalendarDay(first);
    const secondDay = toCalendarDay(second);
    return firstDay !== null && secondDay !== null && firstDay === secondDay;
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
        const checkIn = toCalendarDay(getCheckIn(booking));
        const checkOut = toCalendarDay(getCheckOut(booking));
        const selected = toCalendarDay(selectedDate);
        matchesTab =
          checkIn !== null &&
          checkOut !== null &&
          selected !== null &&
          checkIn <= selected &&
          checkOut > selected;
      }

      return matchesSearch && matchesTab;
    });
  }, [bookings, searchTerm, activeTab, selectedDate, hotel]);

  const countForTab = (tab) =>
    bookings.filter((booking) => {
      if (tab === "Check-ins")
        return isSameDay(getCheckIn(booking), selectedDate);
      if (tab === "Check-outs")
        return isSameDay(getCheckOut(booking), selectedDate);
      const checkIn = toCalendarDay(getCheckIn(booking));
      const checkOut = toCalendarDay(getCheckOut(booking));
      const selected = toCalendarDay(selectedDate);
      return (
        checkIn !== null &&
        checkOut !== null &&
        selected !== null &&
        checkIn <= selected &&
        checkOut > selected
      );
    }).length;

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => {
          const aDate = new Date(
            a.createdAt || a.created_at || a.bookingDate || getCheckIn(a) || 0,
          ).getTime();
          const bDate = new Date(
            b.createdAt || b.created_at || b.bookingDate || getCheckIn(b) || 0,
          ).getTime();
          return bDate - aDate;
        })
        .slice(0, 5),
    [bookings],
  );
  const notificationBookings = newBookings.length
    ? newBookings
    : recentBookings;

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
        {/* GLOBAL TOP BAR */}
        <div className="reservation-globalbar">
          <label className="global-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search reservations, guests, or rooms..."
              aria-label="Search reservations, guests, or rooms"
            />
          </label>
          <span className="globalbar-spacer" />
          <span className="globalbar-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* HEADER */}

        <header className="hotel-admin-header">
          <div className="header-title">
            <span className="header-eyebrow">HOTEL MANAGEMENT</span>

            <h1>Reservations</h1>

            <p>
              Manage bookings for <strong>{hotel?.name || "your hotel"}</strong>
            </p>
          </div>

          <article className="reservation-property-card">
            <div className="reservation-property-image" aria-hidden="true">
              ⌂
            </div>
            <div className="reservation-property-copy">
              <span>WELCOME BACK,</span>
              <strong>{hotel?.name || "Your Hotel"}</strong>
              <small>{hotel?.location || "Property management"}</small>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/hotel-dashboard")}
            >
              View Hotel ↗
            </button>
          </article>

          <div className="admin-welcome">
            <div className="welcome-avatar">👋</div>

            <div className="welcome-text">
              <span>Welcome back,</span>

              <strong>{hotel?.hotelAdmin?.name || "Hotel Admin"}</strong>

              <small>Hotel Administrator</small>
            </div>
          </div>

          <div className="booking-notification-wrap">
            <button
              type="button"
              className={`booking-notification-button ${newBookings.length ? "has-new" : ""}`}
              aria-label={`Notifications${newBookings.length ? `, ${newBookings.length} new bookings` : ""}`}
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <span className="booking-bell" aria-hidden="true">
                🔔
              </span>
              {newBookings.length > 0 && (
                <span className="booking-notification-count">
                  {newBookings.length}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="booking-notification-panel">
                <div className="booking-notification-panel-head">
                  <strong>Booking notifications</strong>
                  <button type="button" onClick={() => setNewBookings([])}>
                    Clear
                  </button>
                </div>
                {notificationBookings.length === 0 ? (
                  <p className="booking-notification-empty">
                    No reservations yet. New bookings will appear here
                    automatically.
                  </p>
                ) : (
                  <>
                    {newBookings.length > 0 && (
                      <div className="notification-section-label">
                        NEW BOOKINGS
                      </div>
                    )}
                    {notificationBookings.map((booking) => (
                      <button
                        type="button"
                        className="booking-notification-item"
                        key={booking._id || booking.id}
                        onClick={() => {
                          setSearchTerm(
                            String(booking._id || booking.id || ""),
                          );
                          setActiveTab("Check-ins");
                          setSelectedDate(
                            getCheckIn(booking)
                              ? new Date(getCheckIn(booking))
                              : new Date(),
                          );
                          setNotificationsOpen(false);
                          setNewBookings((items) =>
                            items.filter(
                              (item) =>
                                String(item._id || item.id) !==
                                String(booking._id || booking.id),
                            ),
                          );
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <span className="booking-notification-item-icon">
                          ♧
                        </span>
                        <span>
                          <strong>
                            {newBookings.some(
                              (item) =>
                                String(item._id || item.id) ===
                                String(booking._id || booking.id),
                            )
                              ? "New reservation"
                              : "Recent booking"}
                          </strong>
                          <small>
                            {getGuestName(booking)} ·{" "}
                            {formatDate(getCheckIn(booking))}
                          </small>
                        </span>
                        {newBookings.some(
                          (item) =>
                            String(item._id || item.id) ===
                            String(booking._id || booking.id),
                        ) && <em>NEW</em>}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="notification-view-all"
                      onClick={() => {
                        setNotificationsOpen(false);
                        setSearchTerm("");
                        setActiveTab("Check-ins");
                        setSelectedDate(new Date());
                      }}
                    >
                      View all reservations →
                    </button>
                  </>
                )}
              </div>
            )}
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
                  <span>{tab}</span>
                  <small className="reservation-tab-count">
                    {countForTab(tab)}
                  </small>
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
          <div className="reservation-results-heading">
            <div>
              <h3>
                {activeTab === "Check-ins"
                  ? "Today's Check-ins"
                  : activeTab === "Check-outs"
                    ? "Today's Check-outs"
                    : "Current Guest Stays"}
              </h3>
              <span>{filteredBookings.length} reservations found</span>
            </div>
            <button
              type="button"
              className="reservation-refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

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
