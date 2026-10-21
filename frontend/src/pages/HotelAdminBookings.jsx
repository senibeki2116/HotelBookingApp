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

const getValue = (object, keys, fallback = "") => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
};

const getGuest = (booking) => {
  const guest = booking?.guest || booking?.user || booking?.customer || {};
  const name =
    getValue(booking, ["guestName", "customerName", "fullName", "name"]) ||
    getValue(guest, ["name", "fullName", "username"]) ||
    `${booking?.firstName || guest.firstName || ""} ${
      booking?.lastName || guest.lastName || ""
    }`.trim();

  return {
    name: name || "Guest",
    email:
      getValue(booking, ["guestEmail", "customerEmail", "email"]) ||
      getValue(guest, ["email"], "No email provided"),
  };
};

const getStatus = (booking) =>
  String(
    getValue(
      booking,
      ["status", "bookingStatus", "reservationStatus"],
      "pending",
    ),
  )
    .toLowerCase()
    .replaceAll(" ", "_");

const getDate = (booking, type) =>
  getValue(
    booking,
    type === "checkIn"
      ? ["checkIn", "checkInDate", "arrivalDate", "startDate"]
      : ["checkOut", "checkOutDate", "departureDate", "endDate"],
  );

const getAmount = (booking) =>
  Number(
    getValue(
      booking,
      [
        "totalPrice",
        "totalAmount",
        "amount",
        "price",
        "total",
        "bookingAmount",
      ],
      0,
    ),
  ) || 0;

const getRoomCount = (booking) =>
  Number(getValue(booking, ["numberOfRooms", "roomCount", "roomsBooked"], 1)) ||
  1;

const getGuestCount = (booking) =>
  Number(
    getValue(booking, ["numberOfGuests", "guestCount", "guests", "adults"], 1),
  ) || 1;

const getHotelName = (hotel) =>
  getValue(hotel, ["name", "hotelName", "propertyName"], "Your Hotel");

const getHotelImage = (hotel) => {
  const raw =
    getValue(hotel, ["image", "imageUrl", "imageURL", "coverImage", "photo"]) ||
    (Array.isArray(hotel?.images) ? hotel.images[0] : "");

  const image = typeof raw === "object" ? raw?.url || raw?.imageUrl || "" : raw;

  if (!image) return "";

  const value = String(image);
  if (/^https?:\/\//i.test(value)) return value;

  return `http://localhost:5000${value.startsWith("/") ? "" : "/"}${value}`;
};

const dateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMoney = (booking) => {
  const amount = getAmount(booking);
  const currency = getValue(booking, ["currency"], "ETB");

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const getInitials = (name = "Guest") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getBookingId = (booking) =>
  String(getValue(booking, ["_id", "id", "bookingId"], ""));

const isCancelled = (booking) =>
  ["cancelled", "canceled", "rejected"].includes(getStatus(booking));

const isConfirmed = (booking) =>
  ["confirmed", "approved", "completed", "checked_in", "checked_out"].includes(
    getStatus(booking),
  );

const statusLabel = (status) => {
  const labels = {
    checked_in: "Checked in",
    checked_out: "Checked out",
    in_progress: "In progress",
  };

  return (
    labels[status] ||
    status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
};

const HotelAdminBookings = () => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState(dateOnly(new Date()));
  const [dateFilterEnabled, setDateFilterEnabled] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newBookingIds, setNewBookingIds] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Prevent overlapping requests and repeated initial loading screens.
  const requestInProgress = useRef(false);
  const hasLoadedOnce = useRef(false);

  const fetchData = useCallback(async (manual = false) => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    if (manual) {
      setRefreshing(true);
    } else if (!hasLoadedOnce.current) {
      setLoading(true);
    }

    setError("");

    try {
      const [hotelResponse, bookingsResponse] = await Promise.all([
        API.get("/hotels/my-hotel").catch(() => null),
        API.get("/bookings/my-hotel"),
      ]);

      const hotelData = hotelResponse?.data;
      const resolvedHotel = hotelData?.hotel || hotelData?.data || hotelData;

      if (resolvedHotel && !Array.isArray(resolvedHotel)) {
        setHotel(resolvedHotel);
      }

      const responseData = bookingsResponse?.data;
      const resolvedBookings = Array.isArray(responseData)
        ? responseData
        : responseData?.bookings ||
          responseData?.data?.bookings ||
          responseData?.data ||
          [];

      if (!Array.isArray(resolvedBookings)) {
        throw new Error("The server returned an unexpected bookings format.");
      }

      setBookings((previous) => {
        const previousIds = new Set(previous.map(getBookingId).filter(Boolean));

        const added = resolvedBookings.filter((booking) => {
          const id = getBookingId(booking);
          return id && !previousIds.has(id);
        });

        // Don't announce all existing bookings as new on the first load.
        if (hasLoadedOnce.current && added.length > 0) {
          setNewBookingIds((current) =>
            [...added.map(getBookingId), ...current]
              .filter((id, index, array) => id && array.indexOf(id) === index)
              .slice(0, 20),
          );
        }

        return resolvedBookings;
      });

      hasLoadedOnce.current = true;
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load reservations. Please try again.",
      );
    } finally {
      requestInProgress.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);

    const interval = setInterval(() => {
      fetchData(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const today = dateOnly(new Date());

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter(isConfirmed).length,
      pending: bookings.filter(
        (booking) => !isCancelled(booking) && !isConfirmed(booking),
      ).length,
      cancelled: bookings.filter(isCancelled).length,
    }),
    [bookings],
  );
  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setError("");

    try {
      const response = await API.get("/bookings/my-hotel");
      const data = response.data;

      const latestBookings = Array.isArray(data)
        ? data
        : (data?.bookings ?? data?.data?.bookings ?? data?.data ?? []);

      if (!Array.isArray(latestBookings)) {
        throw new Error("Invalid bookings response.");
      }

      setBookings(latestBookings);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Refresh failed${err?.response?.status ? ` (${err.response.status})` : ""}.`,
      );
    } finally {
      setRefreshing(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const guest = getGuest(booking);
      const hotelName =
        getValue(booking, ["hotelName", "propertyName"]) ||
        getHotelName(booking?.hotel || hotel);
      const id = getBookingId(booking);
      const roomName = getValue(booking, [
        "roomName",
        "roomType",
        "roomNumber",
      ]);
      const status = getStatus(booking);

      const matchesSearch =
        !query ||
        [guest.name, guest.email, hotelName, id, roomName, status].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(query),
        );

      const checkIn = dateOnly(getDate(booking, "checkIn"));
      const checkOut = dateOnly(getDate(booking, "checkOut"));

      let matchesTab = true;

      if (activeTab === "checkins") matchesTab = checkIn === selectedDate;
      if (activeTab === "checkouts") matchesTab = checkOut === selectedDate;
      if (activeTab === "stays") {
        matchesTab =
          Boolean(checkIn && checkOut) &&
          checkIn <= selectedDate &&
          checkOut > selectedDate &&
          !isCancelled(booking);
      }

      const matchesDate =
        !dateFilterEnabled ||
        checkIn === selectedDate ||
        checkOut === selectedDate;

      return matchesSearch && matchesTab && matchesDate;
    });
  }, [bookings, search, activeTab, selectedDate, dateFilterEnabled, hotel]);

  const todayCheckIns = bookings.filter(
    (booking) =>
      dateOnly(getDate(booking, "checkIn")) === today && !isCancelled(booking),
  );

  const todayCheckOuts = bookings.filter(
    (booking) =>
      dateOnly(getDate(booking, "checkOut")) === today && !isCancelled(booking),
  );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(getValue(b, ["createdAt", "created_at"], 0)).getTime() -
        new Date(getValue(a, ["createdAt", "created_at"], 0)).getTime(),
    )
    .slice(0, 4);

  const moveDate = (days) => {
    const date = new Date(`${selectedDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    setSelectedDate(dateOnly(date));
    setDateFilterEnabled(true);
  };
  const notificationRef = useRef(null);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const resetFilters = () => {
    setSearch("");
    setActiveTab("all");
    setSelectedDate(today);
    setDateFilterEnabled(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const propertyLocation = getValue(
    hotel,
    ["address", "location", "city", "hotelAddress"],
    "Manage your property",
  );

  return (
    <div className="stayora-app">
      <aside className="stayora-sidebar">
        <button
          type="button"
          className="stayora-brand"
          onClick={() => navigate("/admin/hotel-dashboard")}
        >
          <span className="brand-mark">
            <i className="fa-solid fa-hotel" />
          </span>
          <span>
            STAYORA
            <small>HOTEL MANAGEMENT</small>
          </span>
        </button>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="stayora-nav">
          <button
            type="button"
            onClick={() => navigate("/admin/hotel-dashboard")}
          >
            <i className="fa-solid fa-chart-pie" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="active"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <i className="fa-solid fa-calendar-check" />
            <span>Reservations</span>
            <span className="nav-count">{stats.total}</span>
          </button>
        </nav>

        <div className="sidebar-section-label sidebar-section-spaced">
          GENERAL
        </div>

        <nav className="stayora-nav">
          <button type="button" onClick={() => navigate("/")}>
            <i className="fa-solid fa-arrow-up-right-from-square" />
            <span>View Website</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <i className="fa-regular fa-circle-question" />
            </div>
            <strong>Need assistance?</strong>
            <p>We're here to help you manage your property.</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "mailto:support@stayora.com";
              }}
            >
              Contact support <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <button type="button" className="sidebar-logout" onClick={logout}>
            <i className="fa-solid fa-arrow-right-from-bracket" /> Log out
          </button>

          <div className="sidebar-version">STAYORA · HOTEL ADMIN</div>
        </div>
      </aside>

      <main className="stayora-main">
        <header className="stayora-topbar">
          <div className="topbar-title">
            <span>Hotel management</span>
            <strong>Reservations</strong>
          </div>

          <div className="topbar-actions">
            <label className="topbar-search">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reservations..."
                aria-label="Search reservations"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </label>

            <div className="topbar-date">
              <i className="fa-regular fa-calendar" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="notification-wrap" ref={notificationRef}>
  <button
    type="button"
    className={`topbar-icon-button ${notificationsOpen ? "selected" : ""}`}
    onClick={() => setNotificationsOpen((open) => !open)}
    aria-label="Booking notifications"
    aria-expanded={notificationsOpen}
  >
    <span className="bell-character">♧</span>

    {newBookingIds.length > 0 && (
      <span className="notification-count">
        {newBookingIds.length > 9 ? "9+" : newBookingIds.length}
      </span>
    )}
  </button>

  {notificationsOpen && (
    <div className="notification-popover">
      <div className="popover-heading">
        <div>
          <strong>Notifications</strong>
          <p>You have {newBookingIds.length} unread booking updates.</p>
        </div>

        <button
          type="button"
          onClick={() => setNotificationsOpen(false)}
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>

      {newBookingIds.length > 0 ? (
        <>
          {bookings
            .filter((booking) =>
              newBookingIds.includes(getBookingId(booking))
            )
            .slice(0, 5)
            .map((booking) => {
              const guest = getGuest(booking);

              return (
                <div
                  className="popover-booking"
                  key={getBookingId(booking)}
                >
                  <span className="mini-avatar">
                    {getInitials(guest.name)}
                  </span>

                  <div>
                    <strong>{guest.name}</strong>
                    <small>New reservation received</small>
                  </div>
                </div>
              );
            })}

          <button
            type="button"
            className="mark-read-button"
            onClick={() => setNewBookingIds([])}
          >
            Mark all as read
          </button>
        </>
      ) : (
        <div className="popover-empty">
          <div className="notification-empty-icon">✓</div>
          <strong>You're all caught up!</strong>
          <p>New booking updates will appear here.</p>
        </div>
      )}
    </div>
  )}
</div>

            <div className="topbar-avatar" title="Hotel administrator">
              HA
            </div>
          </div>
        </header>

        <div className="stayora-content">
          <div className="stayora-page-heading">
            <div>
              <div className="stayora-eyebrow">
                OVERVIEW <span>/</span> BOOKINGS
              </div>
              <h1>
                Reservations <span className="heading-sparkle">✦</span>
              </h1>
              <p>
                Manage guest stays, track arrivals, and keep every booking
                organized.
              </p>
            </div>

            {/* Working refresh button */}

            <button
              type="button"
              className="refresh-bookings-button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh bookings"
              aria-label="Refresh bookings"
            >
              <span
                className={
                  refreshing
                    ? "refresh-character spinning"
                    : "refresh-character"
                }
              >
                ↻
              </span>
            </button>
          </div>

          <section
            className="property-banner"
            style={
              getHotelImage(hotel)
                ? {
                    backgroundImage: `linear-gradient(90deg, rgba(14,31,57,.94), rgba(19,43,74,.62)), url("${getHotelImage(
                      hotel,
                    )}")`,
                  }
                : undefined
            }
          >
            <div className="property-banner-shade" />
            <div className="property-banner-content">
              <span className="property-label">
                <i className="fa-solid fa-circle-check" /> PROPERTY OVERVIEW
              </span>
              <h2>{getHotelName(hotel)}</h2>
              <p>
                <i className="fa-solid fa-location-dot" /> {propertyLocation}
              </p>
              <div className="property-banner-meta">
                <span>
                  <i className="fa-solid fa-calendar-check" /> Reservation
                  management
                </span>
                <span>
                  <i className="fa-solid fa-shield-halved" /> Admin workspace
                </span>
              </div>
            </div>
            <div className="property-banner-symbol">
              <i className="fa-solid fa-hotel" />
            </div>
          </section>

          {error && (
            <div className="stayora-error">
              <i className="fa-solid fa-triangle-exclamation" />
              <div>
                <strong>Couldn't update reservations</strong>
                <p>{error}</p>
              </div>
              <button
                type="button"
                disabled={refreshing}
                onClick={() => fetchData(true)}
              >
                Try again
              </button>
            </div>
          )}

          <section className="booking-stat-grid">
            {[
              {
                label: "Total bookings",
                value: stats.total,
                note: "All reservations",
                icon: "fa-calendar-days",
                color: "blue",
                decoration: "blue-decoration",
              },
              {
                label: "Confirmed",
                value: stats.confirmed,
                note: "Approved reservations",
                icon: "fa-circle-check",
                color: "green",
                decoration: "green-decoration",
              },
              {
                label: "Pending",
                value: stats.pending,
                note: "Awaiting confirmation",
                icon: "fa-clock",
                color: "amber",
                decoration: "amber-decoration",
              },
              {
                label: "Cancelled",
                value: stats.cancelled,
                note: "Cancelled reservations",
                icon: "fa-ban",
                color: "red",
                decoration: "red-decoration",
              },
            ].map((stat) => (
              <article className="booking-stat-card" key={stat.label}>
                <div className="stat-topline">
                  <span>{stat.label}</span>
                  <span className={`stat-icon ${stat.color}`}>
                    <i className={`fa-solid ${stat.icon}`} />
                  </span>
                </div>
                <div className="stat-number">
                  {loading ? "—" : stat.value.toLocaleString()}
                </div>
                <div className="stat-footnote">
                  <span className={`stat-${stat.color}-dot`} />
                  {stat.note}
                </div>
                <div className={`stat-decoration ${stat.decoration}`}>
                  <i className={`fa-solid ${stat.icon}`} />
                </div>
              </article>
            ))}
          </section>

          <div className="stayora-workspace">
            <section className="reservations-panel">
              <div className="panel-heading">
                <div>
                  <h3>
                    All reservations{" "}
                    <span className="heading-count">
                      {filteredBookings.length}
                    </span>
                  </h3>
                  <p>Review and manage your guest reservations.</p>
                </div>
                <button
                  type="button"
                  className="subtle-button"
                  onClick={resetFilters}
                >
                  <i className="fa-solid fa-filter-circle-xmark" /> Reset
                  filters
                </button>
              </div>

              <div className="reservation-tabs">
                {[
                  ["all", "All bookings"],
                  ["checkins", "Check-ins"],
                  ["checkouts", "Check-outs"],
                  ["stays", "In-house guests"],
                ].map(([key, label]) => (
                  <button
                    type="button"
                    key={key}
                    className={activeTab === key ? "active" : ""}
                    onClick={() => {
                      setActiveTab(key);
                      if (key !== "all") setDateFilterEnabled(true);
                    }}
                  >
                    {label}
                    {key === "checkins" && <span>{todayCheckIns.length}</span>}
                    {key === "checkouts" && (
                      <span>{todayCheckOuts.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="reservation-toolbar">
                <div className="date-navigator">
                  <button
                    type="button"
                    onClick={() => moveDate(-1)}
                    aria-label="Previous day"
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  <label>
                    <i className="fa-regular fa-calendar" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => {
                        setSelectedDate(event.target.value);
                        setDateFilterEnabled(true);
                      }}
                      aria-label="Filter by date"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => moveDate(1)}
                    aria-label="Next day"
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <button
                    type="button"
                    className="today-button"
                    onClick={() => {
                      setSelectedDate(today);
                      setDateFilterEnabled(true);
                    }}
                  >
                    Today
                  </button>
                </div>

                <div className="view-switch" aria-label="Reservation view">
                  <button
                    type="button"
                    className={viewMode === "table" ? "active" : ""}
                    onClick={() => setViewMode("table")}
                    aria-label="Table view"
                  >
                    <i className="fa-solid fa-list" />
                  </button>
                  <button
                    type="button"
                    className={viewMode === "grid" ? "active" : ""}
                    onClick={() => setViewMode("grid")}
                    aria-label="Card view"
                  >
                    <i className="fa-solid fa-grip" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="stayora-loading">
                  <span className="loading-spinner" />
                  <strong>Loading reservations...</strong>
                  <p>Fetching your latest booking details.</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="stayora-empty">
                  <div className="empty-icon">
                    <i className="fa-regular fa-calendar-xmark" />
                  </div>
                  <h4>No reservations found</h4>
                  <p>
                    {search || activeTab !== "all" || dateFilterEnabled
                      ? "Try changing your search or filters to find a reservation."
                      : "New reservations will appear here when guests book your property."}
                  </p>
                  {(search || activeTab !== "all" || dateFilterEnabled) && (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={resetFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : viewMode === "table" ? (
                <div className="reservation-table-wrap">
                  <table className="reservation-table">
                    <thead>
                      <tr>
                        <th>GUEST</th>
                        <th>CHECK-IN</th>
                        <th>CHECK-OUT</th>
                        <th>GUESTS / ROOMS</th>
                        <th>AMOUNT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const guest = getGuest(booking);
                        const id = getBookingId(booking) || guest.name;
                        const status = getStatus(booking);
                        const roomName = getValue(booking, [
                          "roomType",
                          "roomName",
                          "roomNumber",
                        ]);

                        return (
                          <tr key={id}>
                            <td>
                              <div className="guest-cell">
                                <span className="guest-avatar">
                                  {getInitials(guest.name)}
                                </span>
                                <div>
                                  <strong>{guest.name}</strong>
                                  <small>{guest.email}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong className="date-primary">
                                {formatDate(getDate(booking, "checkIn"))}
                              </strong>
                              <small className="date-sub">
                                {getValue(booking, ["checkInTime"])}
                              </small>
                            </td>
                            <td>
                              <strong className="date-primary">
                                {formatDate(getDate(booking, "checkOut"))}
                              </strong>
                              <small className="date-sub">
                                {getValue(booking, ["checkOutTime"])}
                              </small>
                            </td>
                            <td>
                              <strong>
                                {getGuestCount(booking)}{" "}
                                {getGuestCount(booking) === 1
                                  ? "guest"
                                  : "guests"}
                              </strong>
                              <small className="date-sub">
                                {getRoomCount(booking)}{" "}
                                {getRoomCount(booking) === 1 ? "room" : "rooms"}
                                {roomName ? ` · ${roomName}` : ""}
                              </small>
                            </td>
                            <td>
                              <strong className="amount-value">
                                {formatMoney(booking)}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-badge status-${status}`}>
                                {statusLabel(status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="reservation-card-grid">
                  {filteredBookings.map((booking) => {
                    const guest = getGuest(booking);
                    const status = getStatus(booking);
                    const id = getBookingId(booking) || guest.name;

                    return (
                      <article className="reservation-card" key={id}>
                        <div className="reservation-card-top">
                          <span className="guest-avatar">
                            {getInitials(guest.name)}
                          </span>
                          <div className="reservation-card-guest">
                            <strong>{guest.name}</strong>
                            <small>{guest.email}</small>
                          </div>
                          <span className={`status-badge status-${status}`}>
                            {statusLabel(status)}
                          </span>
                        </div>
                        <div className="reservation-card-dates">
                          <div>
                            <small>CHECK-IN</small>
                            <strong>
                              {formatDate(getDate(booking, "checkIn"))}
                            </strong>
                          </div>
                          <i className="fa-solid fa-arrow-right" />
                          <div>
                            <small>CHECK-OUT</small>
                            <strong>
                              {formatDate(getDate(booking, "checkOut"))}
                            </strong>
                          </div>
                        </div>
                        <div className="reservation-card-bottom">
                          <span>
                            <i className="fa-solid fa-user-group" />{" "}
                            {getGuestCount(booking)} guests ·{" "}
                            {getRoomCount(booking)} rooms
                          </span>
                          <strong>{formatMoney(booking)}</strong>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="reservations-panel-footer">
                <span>
                  Showing <strong>{filteredBookings.length}</strong> of{" "}
                  <strong>{bookings.length}</strong> reservations
                </span>
                <span className="auto-refresh-label">
                  <span /> Auto-refresh every 20 seconds
                </span>
              </div>
            </section>

            <aside className="stayora-right-column">
              <section className="side-panel new-bookings-panel">
                <div className="side-panel-heading">
                  <div>
                    <h3>Recent bookings</h3>
                    <p>Latest reservations received</p>
                  </div>
                  <span className="side-panel-icon">
                    <i className="fa-regular fa-bell" />
                  </span>
                </div>

                {recentBookings.length ? (
                  <div className="recent-bookings-list">
                    {recentBookings.map((booking) => {
                      const guest = getGuest(booking);
                      const id = getBookingId(booking) || guest.name;

                      return (
                        <div className="recent-booking-row" key={id}>
                          <span className="guest-avatar small-avatar">
                            {getInitials(guest.name)}
                          </span>
                          <div className="recent-booking-info">
                            <strong>{guest.name}</strong>
                            <small>
                              {formatDate(getDate(booking, "checkIn"))} –{" "}
                              {formatDate(getDate(booking, "checkOut"))}
                            </small>
                          </div>
                          <strong className="recent-booking-price">
                            {formatMoney(booking)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="side-empty">No bookings to show yet.</div>
                )}

                <button
                  type="button"
                  className="side-panel-link"
                  onClick={() => {
                    setActiveTab("all");
                    setDateFilterEnabled(false);
                    setSearch("");
                  }}
                >
                  View all reservations{" "}
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </section>

              <section className="side-panel quick-actions-panel">
                <div className="side-panel-heading">
                  <div>
                    <h3>Quick actions</h3>
                    <p>Get to your workspace faster</p>
                  </div>
                  <span className="side-panel-icon purple">
                    <i className="fa-solid fa-bolt" />
                  </span>
                </div>

                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => navigate("/admin/hotel-dashboard")}
                >
                  <span className="quick-action-icon blue">
                    <i className="fa-solid fa-chart-line" />
                  </span>
                  <span>
                    <strong>Open dashboard</strong>
                    <small>View property performance</small>
                  </span>
                  <i className="fa-solid fa-chevron-right quick-chevron" />
                </button>

                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => navigate("/")}
                >
                  <span className="quick-action-icon green">
                    <i className="fa-solid fa-globe" />
                  </span>
                  <span>
                    <strong>View website</strong>
                    <small>See your public website</small>
                  </span>
                  <i className="fa-solid fa-chevron-right quick-chevron" />
                </button>

                <button
                  type="button"
                  className="quick-action-row"
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                >
                  <span className="quick-action-icon amber">
                    <i
                      className={`fa-solid fa-arrows-rotate ${
                        refreshing ? "refresh-spinning" : ""
                      }`}
                    />
                  </span>
                  <span>
                    <strong>
                      {refreshing ? "Syncing..." : "Sync reservations"}
                    </strong>
                    <small>Fetch the latest booking data</small>
                  </span>
                  <i className="fa-solid fa-chevron-right quick-chevron" />
                </button>
              </section>

              <section className="side-panel today-summary-panel">
                <div className="side-panel-heading">
                  <div>
                    <h3>Today's summary</h3>
                    <p>{formatDate(new Date())}</p>
                  </div>
                  <span className="side-panel-icon green-icon">
                    <i className="fa-regular fa-calendar-check" />
                  </span>
                </div>

                <div className="summary-metric">
                  <span>
                    <i className="summary-dot checkin-dot" /> Expected check-ins
                  </span>
                  <strong>{todayCheckIns.length}</strong>
                </div>
                <div className="summary-metric">
                  <span>
                    <i className="summary-dot checkout-dot" /> Expected
                    check-outs
                  </span>
                  <strong>{todayCheckOuts.length}</strong>
                </div>
                <div className="summary-metric">
                  <span>
                    <i className="summary-dot stay-dot" /> Guests staying today
                  </span>
                  <strong>
                    {
                      bookings.filter((booking) => {
                        const checkIn = dateOnly(getDate(booking, "checkIn"));
                        const checkOut = dateOnly(getDate(booking, "checkOut"));

                        return (
                          !isCancelled(booking) &&
                          checkIn &&
                          checkOut &&
                          checkIn <= today &&
                          checkOut > today
                        );
                      }).length
                    }
                  </strong>
                </div>

                <div className="summary-updated">
                  <i className="fa-regular fa-clock" />
                  {lastUpdated
                    ? `Updated at ${lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Waiting for first update"}
                </div>
              </section>
            </aside>
          </div>

          <footer className="stayora-footer">
            <span>
              © {new Date().getFullYear()} STAYORA. Hotel management workspace.
            </span>
            <span>
              <i className="fa-solid fa-circle-check" /> Your reservations stay
              up to date
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default HotelAdminBookings;
