import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminDashboard.css";

const API_URL = "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85";

const getImage = (hotel) => {
  if (!hotel?.image) return FALLBACK_IMAGE;

  const image = String(hotel.image).trim();

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return `${API_URL}/uploads/${image}`;
};

const getUserInitials = (name = "Admin") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBookingStatus = (status) => {
  return String(status || "confirmed").toLowerCase();
};

const getGuestName = (booking) => {
  if (booking?.user?.name) return booking.user.name;
  if (booking?.guestName) return booking.guestName;
  return "Guest";
};

const getGuestEmail = (booking) => {
  if (booking?.user?.email) return booking.user.email;
  if (booking?.guestEmail) return booking.guestEmail;
  return "Guest booking";
};

const getGuestInitials = (booking) => {
  return getUserInitials(getGuestName(booking));
};

const getBookingRoomText = (booking) => {
  const rooms = Number(booking?.rooms || 1);

  return rooms === 1 ? "1 Room" : `${rooms} Rooms`;
};

export default function HotelAdminDashboard() {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    rooms: "",
    image: "",
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  /* =========================================================
     FETCH HOTEL
     ========================================================= */

  const fetchHotel = async () => {
    try {
      const response = await API.get("/hotels/my-hotel");

      setHotel(response.data);

      setFormData({
        name: response.data?.name || "",
        location: response.data?.location || "",
        description: response.data?.description || "",
        price: response.data?.price || "",
        rooms: response.data?.rooms || "",
        image: response.data?.image || "",
      });
    } catch (err) {
      console.error("FETCH HOTEL ERROR:", err);

      setError(
        err.response?.data?.message || "Unable to load your hotel information.",
      );
    }
  };

  /* =========================================================
     FETCH BOOKINGS
     ========================================================= */

  const fetchBookings = async () => {
    try {
      const response = await API.get("/bookings/my-hotel");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.bookings || [];

      setBookings(data);
    } catch (err) {
      console.error("FETCH BOOKINGS ERROR:", err);

      /*
        We don't replace the entire dashboard with an error
        if only the booking request fails.
      */

      setBookings([]);
    }
  };

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      await Promise.all([fetchHotel(), fetchBookings()]);

      setLoading(false);
    };

    loadDashboard();
  }, []);

  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => getBookingStatus(booking.status) === "confirmed",
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => getBookingStatus(booking.status) === "cancelled",
  ).length;

  const revenue = bookings
    .filter((booking) => getBookingStatus(booking.status) === "confirmed")
    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

  /* =========================================================
     FORM
     ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     UPDATE HOTEL
     ========================================================= */

  const handleUpdateHotel = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await API.put("/hotels/my-hotel", {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price: Number(formData.price),
        rooms: Number(formData.rooms),
        image: formData.image,
      });

      setHotel(response.data);

      setFormData({
        name: response.data?.name || "",
        location: response.data?.location || "",
        description: response.data?.description || "",
        price: response.data?.price || "",
        rooms: response.data?.rooms || "",
        image: response.data?.image || "",
      });

      setShowEditModal(false);
      setSuccess("Your property has been updated successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error("UPDATE HOTEL ERROR:", err);

      setError(err.response?.data?.message || "Unable to update your hotel.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="hotel-dashboard-loading">
        <div className="hotel-loading-spinner"></div>
        <p>Loading your hotel dashboard...</p>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error && !hotel) {
    return (
      <div className="hotel-dashboard-error">
        <div className="hotel-error-card">
          <div className="hotel-error-icon">!</div>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  const hotelImage = getImage(hotel);

  const displayedBookings = bookings.slice(0, 6);

  return (
    <div className="hotel-admin-dashboard">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="hotel-sidebar">
        {/* BRAND */}

        <div className="hotel-brand">
          <div className="hotel-brand-icon">▣</div>

          <div>
            <h2>Stayora</h2>
            <span>Hotel Admin</span>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="hotel-sidebar-section-title">MAIN MENU</div>

        <nav className="hotel-sidebar-nav">
          <button className="hotel-nav-item active">
            <span className="hotel-nav-icon">⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className="hotel-nav-item"
            onClick={() => setShowEditModal(true)}
          >
            <span className="hotel-nav-icon">▣</span>
            <span>My Property</span>
          </button>

          <button
            className="hotel-nav-item"
            onClick={() => navigate("/admin/hotel-bookings")}
          >
            <span className="hotel-nav-icon">▦</span>
            <span>Reservations</span>

            {totalBookings > 0 && (
              <span className="hotel-nav-count">{totalBookings}</span>
            )}
          </button>
        </nav>

        <div className="hotel-sidebar-divider"></div>

        <div className="hotel-sidebar-section-title">MANAGEMENT</div>

        <nav className="hotel-sidebar-nav">
          <button
            className="hotel-nav-item"
            onClick={() =>
              document.querySelector(".hotel-property-card")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <span className="hotel-nav-icon">▤</span>
            <span>Property Details</span>
          </button>

          <button className="hotel-nav-item" onClick={() => navigate("/")}>
            <span className="hotel-nav-icon">↗</span>
            <span>Visit Website</span>
          </button>
        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="hotel-sidebar-bottom">
          <div className="hotel-admin-profile">
            <div className="hotel-admin-avatar">
              {getUserInitials(currentUser?.name)}
            </div>

            <div className="hotel-admin-profile-info">
              <strong>{currentUser?.name || "Hotel Admin"}</strong>
              <span>Hotel Manager</span>
            </div>

            <span className="hotel-profile-arrow">⌄</span>
          </div>

          <button className="hotel-signout-button" onClick={handleLogout}>
            <span>↪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="hotel-dashboard-main">
        {/* HEADER */}

        <header className="hotel-dashboard-header">
          <div>
            <div className="hotel-header-label">PROPERTY OVERVIEW</div>

            <h1>Good morning, {currentUser?.name || "Admin"} ☀️</h1>

            <p>Here's what's happening with your hotel today.</p>
          </div>

          <div className="hotel-header-actions">
            <button
              className="hotel-view-website"
              onClick={() => navigate("/")}
            >
              View Website
              <span>↗</span>
            </button>

            <button className="hotel-notification">
              ♢<span></span>
            </button>

            <div className="hotel-header-avatar">
              {getUserInitials(currentUser?.name)}
            </div>
          </div>
        </header>

        {/* SUCCESS */}

        {success && (
          <div className="hotel-success-message">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && hotel && <div className="hotel-dashboard-alert">{error}</div>}

        {/* ===================================================
            PROPERTY HERO
            =================================================== */}

        <section className="hotel-property-hero">
          <img
            src={hotelImage}
            alt={hotel?.name || "Hotel"}
            className="hotel-hero-image"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="hotel-hero-overlay"></div>

          <div className="hotel-hero-content">
            <div className="hotel-live-badge">
              <span></span>
              Your Property is Live
            </div>

            <h2>{hotel?.name || "My Hotel"}</h2>

            <div className="hotel-hero-location">
              <span>●</span>
              {hotel?.location || "Location not available"}
            </div>

            <p>
              {hotel?.description ||
                "Manage your property, reservations and hotel information from your dashboard."}
            </p>

            <div className="hotel-hero-features">
              <span>
                <b>▣</b>
                {hotel?.rooms || 0} Rooms
              </span>

              <span>
                <b>⌁</b>
                Free WiFi
              </span>

              <span>
                <b>♒</b>
                Hotel Services
              </span>

              <span>
                <b>★</b>
                Premium Stay
              </span>
            </div>

            <button
              className="hotel-edit-property-button"
              onClick={() => setShowEditModal(true)}
            >
              ✎ Edit Property
            </button>
          </div>
        </section>

        {/* ===================================================
            STATISTICS
            =================================================== */}

        <section className="hotel-statistics">
          <div className="hotel-stat-card">
            <div className="hotel-stat-icon blue">▦</div>

            <div>
              <span>Total Bookings</span>
              <strong>{totalBookings}</strong>

              <small>Your property reservations</small>
            </div>
          </div>

          <div className="hotel-stat-card">
            <div className="hotel-stat-icon green">✓</div>

            <div>
              <span>Confirmed Stay</span>
              <strong>{confirmedBookings}</strong>

              <small>Confirmed reservations</small>
            </div>
          </div>

          <div className="hotel-stat-card">
            <div className="hotel-stat-icon purple">$</div>

            <div>
              <span>Total Revenue</span>
              <strong>{formatCurrency(revenue)}</strong>

              <small>From confirmed bookings</small>
            </div>
          </div>

          <div className="hotel-stat-card">
            <div className="hotel-stat-icon orange">▰</div>

            <div>
              <span>Total Rooms</span>
              <strong>{hotel?.rooms || 0}</strong>

              <small>Property room capacity</small>
            </div>
          </div>
        </section>

        {/* ===================================================
            LOWER CONTENT
            =================================================== */}

        <section className="hotel-dashboard-grid">
          {/* RECENT RESERVATIONS */}

          <div className="hotel-reservations-card dashboard-white-card">
            <div className="dashboard-card-header">
              <div>
                <span>BOOKING ACTIVITY</span>
                <h3>Recent Reservations</h3>
              </div>

              <button onClick={() => navigate("/admin/hotel-bookings")}>
                View All
              </button>
            </div>

            {displayedBookings.length === 0 ? (
              <div className="hotel-empty-reservations">
                <div>▦</div>
                <h4>No reservations yet</h4>
                <p>Reservations for your hotel will appear here.</p>
              </div>
            ) : (
              <div className="hotel-reservation-table-wrapper">
                <table className="hotel-reservation-table">
                  <thead>
                    <tr>
                      <th>GUEST</th>
                      <th>BOOKING DATE</th>
                      <th>ROOMS</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {displayedBookings.map((booking) => {
                      const status = getBookingStatus(booking.status);

                      return (
                        <tr key={booking._id || booking.id}>
                          <td>
                            <div className="hotel-guest">
                              <div className="hotel-guest-avatar">
                                {getGuestInitials(booking)}
                              </div>

                              <div>
                                <strong>{getGuestName(booking)}</strong>

                                <span>{getGuestEmail(booking)}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="hotel-booking-date">
                              {formatDate(booking.createdAt || booking.checkIn)}
                            </div>
                          </td>

                          <td>
                            <span className="hotel-room-text">
                              {getBookingRoomText(booking)}
                            </span>
                          </td>

                          <td>
                            <strong className="hotel-booking-price">
                              {formatCurrency(booking.totalPrice)}
                            </strong>
                          </td>

                          <td>
                            <span className={`hotel-status ${status}`}>
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
          </div>

          {/* RIGHT COLUMN */}

          <div className="hotel-right-column">
            {/* MY PROPERTY */}

            <div className="hotel-property-card dashboard-white-card">
              <div className="dashboard-card-header">
                <div>
                  <span>PROPERTY</span>
                  <h3>My Property</h3>
                </div>

                <button onClick={() => setShowEditModal(true)}>Edit</button>
              </div>

              <img
                src={hotelImage}
                alt={hotel?.name || "Hotel"}
                className="hotel-property-small-image"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              <div className="hotel-property-information">
                <div className="hotel-property-title-row">
                  <h3>{hotel?.name || "My Hotel"}</h3>

                  <span className="hotel-active-badge">Active</span>
                </div>

                <p className="hotel-small-location">
                  ● {hotel?.location || "Location unavailable"}
                </p>

                <div className="hotel-small-stats">
                  <span>▣ {hotel?.rooms || 0} Rooms</span>

                  <span>$ {hotel?.price || 0}/night</span>
                </div>

                <p className="hotel-small-description">
                  {hotel?.description ||
                    "Your property information appears here."}
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="hotel-quick-card dashboard-white-card">
              <div className="dashboard-card-header">
                <div>
                  <span>SHORTCUTS</span>
                  <h3>Quick Actions</h3>
                </div>
              </div>

              <div className="hotel-quick-actions">
                <button onClick={() => setShowEditModal(true)}>
                  <span className="quick-icon blue">▣</span>

                  <span>Edit Property</span>
                </button>

                <button onClick={() => navigate("/admin/hotel-bookings")}>
                  <span className="quick-icon green">▦</span>

                  <span>Manage Bookings</span>
                </button>

                <button onClick={() => navigate("/")}>
                  <span className="quick-icon purple">★</span>

                  <span>View Website</span>
                </button>

                <button onClick={() => setShowEditModal(true)}>
                  <span className="quick-icon orange">⚙</span>

                  <span>Update Information</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          EDIT PROPERTY MODAL
          ===================================================== */}

      {showEditModal && (
        <div
          className="hotel-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="hotel-edit-modal">
            <div className="hotel-modal-header">
              <div>
                <span>PROPERTY MANAGEMENT</span>
                <h2>Edit Your Property</h2>
                <p>
                  Update your hotel information and keep your property details
                  accurate.
                </p>
              </div>

              <button
                className="hotel-modal-close"
                onClick={() => !saving && setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateHotel}>
              <div className="hotel-form-grid">
                <div className="hotel-form-group">
                  <label>Hotel Name</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="hotel-form-group">
                  <label>Location</label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="hotel-form-group">
                  <label>Price Per Night</label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="hotel-form-group">
                  <label>Total Rooms</label>

                  <input
                    type="number"
                    name="rooms"
                    value={formData.rooms}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="hotel-form-group full">
                  <label>Hotel Image URL / File Name</label>

                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="hotel-form-group full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="hotel-modal-actions">
                <button
                  type="button"
                  className="hotel-cancel-button"
                  onClick={() => !saving && setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
