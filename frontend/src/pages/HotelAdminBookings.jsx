import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminBookings.css";

const POLL_INTERVAL = 20000;

const HotelAdminBookings = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Check-ins");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  );
  const [viewMode, setViewMode] = useState("list");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newBookings, setNewBookings] = useState([]);

  const knownBookingIds = useRef(null);

  const getBookingId = (booking) => String(booking?._id || booking?.id || "");

  const getGuestName = (booking) =>
    booking?.guestName ||
    booking?.user?.name ||
    booking?.guest?.name ||
    booking?.customerName ||
    "Guest";

  const getGuestEmail = (booking) =>
    booking?.guestEmail ||
    booking?.user?.email ||
    booking?.guest?.email ||
    booking?.email ||
    "No email provided";

  const getHotelName = (booking) =>
    booking?.hotel?.name || booking?.hotelName || hotel?.name || "Your hotel";

  const getCheckIn = (booking) =>
    booking?.checkIn ||
    booking?.checkInDate ||
    booking?.checkin ||
    booking?.startDate ||
    "";

  const getCheckOut = (booking) =>
    booking?.checkOut ||
    booking?.checkOutDate ||
    booking?.checkout ||
    booking?.endDate ||
    "";

  const getAmount = (booking) =>
    Number(
      booking?.totalPrice ??
        booking?.totalAmount ??
        booking?.price ??
        booking?.amount ??
        0,
    );

  const getStatus = (booking) =>
    String(booking?.status || "Pending").toLowerCase();

  const getGuestCount = (booking) =>
    Number(
      booking?.guests ?? booking?.numberOfGuests ?? booking?.guestCount ?? 1,
    );

  const getRoomCount = (booking) =>
    Number(booking?.rooms ?? booking?.numberOfRooms ?? booking?.roomCount ?? 1);

  const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value) => {
    const date = parseDate(value);
    if (!date) return "—";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLongDate = (value) => {
    const date = parseDate(value);
    if (!date) return "Select a date";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const toDateKey = (value) => {
    const date = parseDate(value);
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isSameDay = (first, second) =>
    Boolean(first && second && toDateKey(first) === toDateKey(second));

  const getInitials = (name) =>
    String(name || "Guest")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "G";

  const getToken = () =>
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  const fetchHotel = useCallback(async () => {
    try {
      const token = getToken();
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
            },
          }
        : {};

      const response = await API.get("/hotels/my-hotel", config);
      const hotelData =
        response.data?.hotel || response.data?.data || response.data;

      setHotel(hotelData || null);
      return hotelData;
    } catch (err) {
      console.error("Unable to load hotel:", err);
      throw err;
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await API.get("/bookings/my-hotel");
      const responseData = response.data;

      const list = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.bookings)
          ? responseData.bookings
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

      setBookings(list);

      const currentIds = new Set(list.map(getBookingId).filter(Boolean));

      if (knownBookingIds.current === null) {
        knownBookingIds.current = currentIds;
      } else {
        const newlyAdded = list.filter((booking) => {
          const id = getBookingId(booking);
          return id && !knownBookingIds.current.has(id);
        });

        if (newlyAdded.length) {
          setNewBookings((previous) =>
            [...newlyAdded, ...previous]
              .filter(
                (booking, index, array) =>
                  array.findIndex(
                    (item) => getBookingId(item) === getBookingId(booking),
                  ) === index,
              )
              .slice(0, 8),
          );
        }

        knownBookingIds.current = currentIds;
      }

      return list;
    } catch (err) {
      console.error("Unable to load bookings:", err);
      throw err;
    }
  }, []);

  const loadPage = useCallback(
    async (showError = true) => {
      try {
        await Promise.all([fetchHotel(), fetchBookings()]);
        setError("");
      } catch (err) {
        if (showError) {
          setError(
            err?.response?.data?.message ||
              "We couldn't load your hotel bookings. Please refresh and try again.",
          );
        }
      }
    },
    [fetchHotel, fetchBookings],
  );

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await loadPage();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const interval = setInterval(() => {
      loadPage(false);
    }, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [loadPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPage();
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const changeDate = (amount) => {
    const date = parseDate(`${selectedDate}T12:00:00`) || new Date();
    date.setDate(date.getDate() + amount);
    setSelectedDate(toDateKey(date));
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter(
      (booking) => getStatus(booking) === "confirmed",
    ).length;
    const pending = bookings.filter(
      (booking) => getStatus(booking) === "pending",
    ).length;
    const cancelled = bookings.filter(
      (booking) => getStatus(booking) === "cancelled",
    ).length;

    return { total, confirmed, pending, cancelled };
  }, [bookings]);

  const tabMatchesDate = (booking, tab) => {
    const checkIn = getCheckIn(booking);
    const checkOut = getCheckOut(booking);
    const day = selectedDate;

    if (tab === "Check-ins") return isSameDay(checkIn, day);
    if (tab === "Check-outs") return isSameDay(checkOut, day);

    if (tab === "Stay-overs") {
      const start = toDateKey(checkIn);
      const end = toDateKey(checkOut);

      return Boolean(start && end && start < day && day < end);
    }

    return true;
  };

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesTab = tabMatchesDate(booking, activeTab);

      const searchableText = [
        getGuestName(booking),
        getGuestEmail(booking),
        getHotelName(booking),
        getBookingId(booking),
        booking?.status,
      ]
        .join(" ")
        .toLowerCase();

      return matchesTab && (!query || searchableText.includes(query));
    });
  }, [bookings, activeTab, selectedDate, searchTerm, hotel]);

  const countForTab = (tab) =>
    bookings.filter((booking) => tabMatchesDate(booking, tab)).length;

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => {
          const dateA = parseDate(
            a?.createdAt || a?.created_at || a?.bookingDate || getCheckIn(a),
          );
          const dateB = parseDate(
            b?.createdAt || b?.created_at || b?.bookingDate || getCheckIn(b),
          );

          return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
        })
        .slice(0, 5),
    [bookings],
  );

  const notificationBookings =
    newBookings.length > 0 ? newBookings : recentBookings;

  const selectNotification = (booking) => {
    const checkIn = getCheckIn(booking);

    setSearchTerm(getBookingId(booking));
    setActiveTab("Check-ins");

    if (checkIn) setSelectedDate(toDateKey(checkIn));

    setNotificationsOpen(false);
    setNewBookings((previous) =>
      previous.filter((item) => getBookingId(item) !== getBookingId(booking)),
    );
  };

  const tabs = [
    { label: "Check-ins", icon: "↘", count: countForTab("Check-ins") },
    { label: "Check-outs", icon: "↗", count: countForTab("Check-outs") },
    { label: "Stay-overs", icon: "☾", count: countForTab("Stay-overs") },
  ];

  if (loading) {
    return (
      <div className="booking-loading-screen">
        <div className="booking-loader" />
        <h2>Preparing your workspace</h2>
        <p>Loading your hotel and reservations...</p>
      </div>
    );
  }

  return (
    <div className="hotel-admin-layout">
      <aside className="hotel-admin-sidebar">
        <div className="stayora-brand">
          <div className="stayora-brand-mark">S</div>
          <div>
            <strong>STAYORA</strong>
            <span>HOTEL MANAGEMENT</span>
          </div>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="hotel-admin-navigation">
          <button
            className="sidebar-nav-item"
            onClick={() => navigate("/admin/hotel-dashboard")}
          >
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </button>

          <button
            className="sidebar-nav-item active"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <span className="nav-icon">▤</span>
            <span>Reservations</span>
            <span className="nav-active-dot" />
          </button>

          <button className="sidebar-nav-item" onClick={() => navigate("/")}>
            <span className="nav-icon">↗</span>
            <span>View website</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <span className="help-icon">✦</span>
            <strong>Stay organized</strong>
            <p>Manage guest arrivals and departures from one place.</p>
          </div>

          <button
            className="sidebar-nav-item logout-item"
            onClick={handleLogout}
          >
            <span className="nav-icon">⇥</span>
            <span>Sign out</span>
          </button>

          <div className="sidebar-version">STAYORA ADMIN · 1.0</div>
        </div>
      </aside>

      <main className="hotel-admin-main">
        <header className="reservation-globalbar">
          <div className="globalbar-breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Reservations</strong>
          </div>

          <div className="globalbar-actions">
            <label className="global-search">
              <span>⌕</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search guest, email or booking ID..."
                aria-label="Search bookings"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="globalbar-date">
              <span>◷</span>
              {formatDate(new Date())}
            </div>

            <div className="booking-notification-wrap">
              <button
                className={`notification-bell ${
                  notificationsOpen ? "is-open" : ""
                }`}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Toggle booking notifications"
                aria-expanded={notificationsOpen}
              >
                ♧
                {newBookings.length > 0 && (
                  <span className="notification-count">
                    {newBookings.length > 9 ? "9+" : newBookings.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <div>
                      <strong>Booking activity</strong>
                      <span>
                        {newBookings.length
                          ? `${newBookings.length} new booking${
                              newBookings.length === 1 ? "" : "s"
                            }`
                          : "Recent reservations"}
                      </span>
                    </div>
                    <button
                      onClick={() => setNewBookings([])}
                      disabled={!newBookings.length}
                    >
                      Clear new
                    </button>
                  </div>

                  <div className="notification-list">
                    {notificationBookings.length === 0 ? (
                      <div className="notification-empty">
                        No bookings to display yet.
                      </div>
                    ) : (
                      notificationBookings.map((booking) => (
                        <button
                          className="notification-item"
                          key={getBookingId(booking)}
                          onClick={() => selectNotification(booking)}
                        >
                          <span className="notification-avatar">
                            {getInitials(getGuestName(booking))}
                          </span>
                          <span className="notification-copy">
                            <strong>{getGuestName(booking)}</strong>
                            <span>
                              {getBookingId(booking)
                                ? `Booking #${getBookingId(booking).slice(-7)}`
                                : "New reservation"}
                            </span>
                          </span>
                          <span className="notification-arrow">›</span>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    className="notification-footer"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    View all reservations →
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="reservation-page-content">
          <div className="reservation-page-heading">
            <div>
              <div className="eyebrow-label">
                <span className="eyebrow-line" />
                HOTEL OPERATIONS
              </div>
              <h1>Reservations</h1>
              <p>Manage arrivals, departures, and guest stays in one place.</p>
            </div>

            <div className="heading-hotel-card">
              <div className="hotel-card-symbol">⌂</div>
              <div className="heading-hotel-copy">
                <span>YOUR PROPERTY</span>
                <strong>{hotel?.name || "My hotel"}</strong>
                <small>
                  {hotel?.address || hotel?.location || "Hotel workspace"}
                </small>
              </div>
              <span className="property-live-dot" title="Workspace active" />
            </div>
          </div>

          {error && (
            <div className="booking-error" role="alert">
              <span className="error-symbol">!</span>
              <div>
                <strong>Unable to update reservations</strong>
                <p>{error}</p>
              </div>
              <button onClick={handleRefresh} disabled={refreshing}>
                Try again
              </button>
            </div>
          )}

          <section
            className="reservation-stats-grid"
            aria-label="Booking statistics"
          >
            <article className="reservation-stat-card">
              <div className="stat-card-top">
                <span>Total reservations</span>
                <span className="stat-icon stat-icon-blue">▤</span>
              </div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-bottom">
                <span className="stat-dot blue-dot" />
                All bookings received
              </div>
            </article>

            <article className="reservation-stat-card">
              <div className="stat-card-top">
                <span>Confirmed</span>
                <span className="stat-icon stat-icon-green">✓</span>
              </div>
              <div className="stat-card-value">{stats.confirmed}</div>
              <div className="stat-card-bottom">
                <span className="stat-dot green-dot" />
                Confirmed reservations
              </div>
            </article>

            <article className="reservation-stat-card">
              <div className="stat-card-top">
                <span>Awaiting confirmation</span>
                <span className="stat-icon stat-icon-amber">◷</span>
              </div>
              <div className="stat-card-value">{stats.pending}</div>
              <div className="stat-card-bottom">
                <span className="stat-dot amber-dot" />
                Pending reservations
              </div>
            </article>

            <article className="reservation-stat-card">
              <div className="stat-card-top">
                <span>Cancelled</span>
                <span className="stat-icon stat-icon-red">×</span>
              </div>
              <div className="stat-card-value">{stats.cancelled}</div>
              <div className="stat-card-bottom">
                <span className="stat-dot red-dot" />
                Cancelled reservations
              </div>
            </article>
          </section>

          <section className="reservation-workspace">
            <div className="reservation-workspace-heading">
              <div>
                <h2>Reservation overview</h2>
                <p>Review guest movements and reservation details.</p>
              </div>

              <button
                className="refresh-button"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <span
                  className={
                    refreshing ? "refresh-symbol spinning" : "refresh-symbol"
                  }
                >
                  ↻
                </span>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="reservation-toolbar">
              <div className="reservation-tabs" role="tablist">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    role="tab"
                    aria-selected={activeTab === tab.label}
                    className={`reservation-tab ${
                      activeTab === tab.label ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.label)}
                  >
                    <span className="reservation-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                    <span className="reservation-tab-count">{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="reservation-date-control">
                <button
                  className="date-step-button"
                  onClick={() => changeDate(-1)}
                  aria-label="Previous day"
                >
                  ‹
                </button>
                <label className="selected-date-label">
                  <span>◷</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    aria-label="Select reservation date"
                  />
                </label>
                <button
                  className="date-step-button"
                  onClick={() => changeDate(1)}
                  aria-label="Next day"
                >
                  ›
                </button>
                <button
                  className="today-button"
                  onClick={() =>
                    setSelectedDate(new Date().toLocaleDateString("en-CA"))
                  }
                >
                  Today
                </button>
              </div>
            </div>

            <div className="reservation-list-toolbar">
              <div>
                <h3>{activeTab}</h3>
                <p>{formatLongDate(`${selectedDate}T12:00:00`)}</p>
              </div>

              <div className="reservation-list-actions">
                <span className="results-count">
                  <strong>{filteredBookings.length}</strong>{" "}
                  {filteredBookings.length === 1
                    ? "reservation"
                    : "reservations"}
                </span>

                <div
                  className="view-mode-switch"
                  aria-label="Booking display mode"
                >
                  <button
                    className={viewMode === "list" ? "active" : ""}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    title="List view"
                  >
                    ☷
                  </button>
                  <button
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    ▦
                  </button>
                </div>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="booking-empty-state">
                <div className="empty-state-icon">▤</div>
                <h3>No reservations found</h3>
                <p>
                  {searchTerm
                    ? "Try another guest name, email, or booking ID."
                    : `There are no reservations matching ${activeTab.toLowerCase()} for this date.`}
                </p>
                <div className="empty-state-actions">
                  {searchTerm && (
                    <button
                      className="secondary-action-button"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </button>
                  )}
                  <button
                    className="primary-action-button"
                    onClick={() => {
                      setSelectedDate(new Date().toLocaleDateString("en-CA"));
                      setActiveTab("Check-ins");
                      setSearchTerm("");
                    }}
                  >
                    View today's check-ins
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="booking-card-grid">
                {filteredBookings.map((booking) => {
                  const id = getBookingId(booking);
                  const status = getStatus(booking);

                  return (
                    <article
                      className="booking-detail-card"
                      key={
                        id || `${getGuestName(booking)}-${getCheckIn(booking)}`
                      }
                    >
                      <div className="booking-card-heading">
                        <div className="guest-avatar">
                          {getInitials(getGuestName(booking))}
                        </div>
                        <div className="booking-guest-copy">
                          <strong>{getGuestName(booking)}</strong>
                          <span>{getGuestEmail(booking)}</span>
                        </div>
                        <span
                          className={`booking-status status-${status.replace(/\s+/g, "-")}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="booking-card-reference">
                        <span>BOOKING REFERENCE</span>
                        <strong>
                          #{id ? id.slice(-8).toUpperCase() : "N/A"}
                        </strong>
                      </div>

                      <div className="booking-card-property">
                        <span className="property-mini-icon">⌂</span>
                        <span>{getHotelName(booking)}</span>
                      </div>

                      <div className="booking-card-dates">
                        <div>
                          <span>CHECK-IN</span>
                          <strong>{formatDate(getCheckIn(booking))}</strong>
                        </div>
                        <span className="date-connector">→</span>
                        <div>
                          <span>CHECK-OUT</span>
                          <strong>{formatDate(getCheckOut(booking))}</strong>
                        </div>
                      </div>

                      <div className="booking-card-footer">
                        <div className="booking-card-guests">
                          <span>♙</span>
                          {getGuestCount(booking)} guest(s) ·{" "}
                          {getRoomCount(booking)} room(s)
                        </div>
                        <strong className="booking-card-amount">
                          {getAmount(booking).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}{" "}
                          <small>{booking?.currency || "ETB"}</small>
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="booking-table-container">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>GUEST</th>
                      <th>HOTEL</th>
                      <th>CHECK-IN</th>
                      <th>CHECK-OUT</th>
                      <th>GUESTS / ROOMS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBookings.map((booking) => {
                      const id = getBookingId(booking);
                      const status = getStatus(booking);

                      return (
                        <tr
                          key={
                            id ||
                            `${getGuestName(booking)}-${getCheckIn(booking)}`
                          }
                        >
                          <td>
                            <div className="table-guest-cell">
                              <div className="guest-avatar">
                                {getInitials(getGuestName(booking))}
                              </div>
                              <div className="table-guest-copy">
                                <strong>{getGuestName(booking)}</strong>
                                <span>{getGuestEmail(booking)}</span>
                                <small>
                                  #{id ? id.slice(-8).toUpperCase() : "N/A"}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-hotel-name">
                              <span className="property-mini-icon">⌂</span>
                              {getHotelName(booking)}
                            </div>
                          </td>
                          <td>
                            <span className="table-date">
                              {formatDate(getCheckIn(booking))}
                            </span>
                          </td>
                          <td>
                            <span className="table-date">
                              {formatDate(getCheckOut(booking))}
                            </span>
                          </td>
                          <td>
                            <span className="table-detail-value">
                              {getGuestCount(booking)} guest(s)
                            </span>
                            <span className="table-detail-subvalue">
                              {getRoomCount(booking)} room(s)
                            </span>
                          </td>
                          <td>
                            <strong className="table-amount">
                              {getAmount(booking).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}{" "}
                              <small>{booking?.currency || "ETB"}</small>
                            </strong>
                          </td>
                          <td>
                            <span
                              className={`booking-status status-${status.replace(/\s+/g, "-")}`}
                            >
                              <span className="status-indicator" />
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="reservation-workspace-footer">
              <span>
                Showing <strong>{filteredBookings.length}</strong> of{" "}
                <strong>{bookings.length}</strong> reservations
              </span>
              <span className="auto-refresh-indicator">
                <span /> Updates automatically every 20 seconds
              </span>
            </div>
          </section>

          <footer className="hotel-admin-footer">
            <span>© {new Date().getFullYear()} STAYORA</span>
            <span>Hospitality, made simpler.</span>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default HotelAdminBookings;
