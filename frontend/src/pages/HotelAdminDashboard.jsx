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

const getUserInitials = (name = "Admin") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBookingStatus = (status) =>
  String(status || "confirmed").toLowerCase();

const getGuestName = (booking) =>
  booking?.user?.name || booking?.guestName || "Guest";

const getGuestEmail = (booking) =>
  booking?.user?.email || booking?.guestEmail || "Guest booking";

const isSameDay = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

export default function HotelAdminDashboard() {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    price: "",
    rooms: "",
    image: "",
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    roomType: "Standard",
    price: "",
    status: "available",
    description: "",
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

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

  const fetchBookings = async () => {
    try {
      const response = await API.get("/bookings/my-hotel");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.bookings || [];

      setBookings(data);
    } catch (err) {
      console.error("FETCH BOOKINGS ERROR:", err);
      setBookings([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await API.get("/rooms/my-hotel");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.rooms || [];

      setRooms(data);
    } catch (err) {
      console.error("FETCH ROOMS ERROR:", err);
      setRooms([]);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    await Promise.all([fetchHotel(), fetchBookings(), fetchRooms()]);

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => getBookingStatus(booking.status) === "confirmed",
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => getBookingStatus(booking.status) === "cancelled",
  ).length;

  const activeBookings = bookings.filter((booking) => {
    if (getBookingStatus(booking.status) !== "confirmed") {
      return false;
    }

    const now = new Date();

    return new Date(booking.checkIn) <= now && new Date(booking.checkOut) > now;
  }).length;

  const todayCheckIns = bookings.filter(
    (booking) =>
      getBookingStatus(booking.status) === "confirmed" &&
      isSameDay(booking.checkIn),
  ).length;

  const todayCheckOuts = bookings.filter(
    (booking) =>
      getBookingStatus(booking.status) === "confirmed" &&
      isSameDay(booking.checkOut),
  ).length;

  const revenue = bookings
    .filter((booking) => getBookingStatus(booking.status) === "confirmed")
    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

  const totalRooms = rooms.length || Number(hotel?.rooms || 0);

  const availableRooms = rooms.filter(
    (room) => String(room.status).toLowerCase() === "available",
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => String(room.status).toLowerCase() === "occupied",
  ).length;

  const reservedRooms = rooms.filter(
    (room) => String(room.status).toLowerCase() === "reserved",
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => String(room.status).toLowerCase() === "maintenance",
  ).length;

  const occupancyPercentage =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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
      showSuccess("Property updated successfully.");
    } catch (err) {
      console.error("UPDATE HOTEL ERROR:", err);

      setError(err.response?.data?.message || "Unable to update your hotel.");
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const handleRoomChange = (event) => {
    const { name, value } = event.target;

    setRoomForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddRoom = () => {
    setEditingRoom(null);

    setRoomForm({
      roomNumber: "",
      roomType: "Standard",
      price: hotel?.price || "",
      status: "available",
      description: "",
    });

    setShowRoomModal(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);

    setRoomForm({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "Standard",
      price: room.price || "",
      status: room.status || "available",
      description: room.description || "",
    });

    setShowRoomModal(true);
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        roomNumber: roomForm.roomNumber,
        roomType: roomForm.roomType,
        price: Number(roomForm.price),
        status: roomForm.status,
        description: roomForm.description,
      };

      if (editingRoom) {
        await API.put(`/rooms/${editingRoom._id}`, payload);

        showSuccess("Room updated successfully.");
      } else {
        await API.post("/rooms", payload);

        showSuccess("Room added successfully.");
      }

      setShowRoomModal(false);
      setEditingRoom(null);

      await fetchRooms();
    } catch (err) {
      console.error("ROOM SAVE ERROR:", err);

      setError(err.response?.data?.message || "Unable to save room.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await API.delete(`/rooms/${roomId}`);

      showSuccess("Room deleted successfully.");

      await fetchRooms();
    } catch (err) {
      console.error("DELETE ROOM ERROR:", err);

      setError(err.response?.data?.message || "Unable to delete room.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="hotel-dashboard-loading">
        <div className="hotel-loading-spinner"></div>
        <strong>Loading dashboard</strong>
        <p>Preparing your property overview...</p>
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="hotel-dashboard-error">
        <div className="hotel-error-card">
          <div className="hotel-error-icon">!</div>
          <span className="hotel-error-label">DASHBOARD ERROR</span>
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button onClick={loadDashboard}>Try Again</button>
        </div>
      </div>
    );
  }

  const hotelImage = getImage(hotel);

  const displayedBookings = bookings.slice(0, 6);

  return (
    <div className="hotel-admin-dashboard">
      {/* SIDEBAR */}

      <aside className="hotel-sidebar">
        <div className="hotel-brand">
          <div className="hotel-brand-logo">S</div>

          <div>
            <h2>Stayora</h2>
            <span>Hotel Management</span>
          </div>
        </div>

        <div className="hotel-sidebar-label">MAIN MENU</div>

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
            onClick={() =>
              document.querySelector(".hotel-room-management")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <span className="hotel-nav-icon">▤</span>
            <span>Rooms</span>
            {rooms.length > 0 && (
              <span className="hotel-nav-count">{rooms.length}</span>
            )}
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

        <div className="hotel-sidebar-line"></div>

        <div className="hotel-sidebar-label">MANAGEMENT</div>

        <nav className="hotel-sidebar-nav">
          <button
            className="hotel-nav-item"
            onClick={() =>
              document.querySelector(".hotel-property-card")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <span className="hotel-nav-icon">◈</span>
            <span>Property Details</span>
          </button>

          <button className="hotel-nav-item" onClick={() => navigate("/")}>
            <span className="hotel-nav-icon">↗</span>
            <span>Visit Website</span>
          </button>
        </nav>

        <div className="hotel-sidebar-bottom">
          <div className="hotel-admin-profile">
            <div className="hotel-admin-avatar">
              {getUserInitials(currentUser?.name)}
            </div>

            <div className="hotel-admin-profile-info">
              <strong>{currentUser?.name || "Hotel Admin"}</strong>

              <span>Hotel Manager</span>
            </div>
          </div>

          <button className="hotel-signout-button" onClick={handleLogout}>
            <span>↪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="hotel-dashboard-main">
        <header className="hotel-dashboard-header">
          <div>
            <span className="hotel-header-kicker">PROPERTY OVERVIEW</span>

            <h1>
              Welcome back, {currentUser?.name || "Admin"}
              <span>👋</span>
            </h1>

            <p>Here's what's happening with your property today.</p>
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
              ♢<i></i>
            </button>

            <div className="hotel-header-avatar">
              {getUserInitials(currentUser?.name)}
            </div>
          </div>
        </header>

        {success && (
          <div className="hotel-success-message">
            <span>✓</span>
            {success}
          </div>
        )}

        {error && hotel && (
          <div className="hotel-dashboard-alert">
            <span>!</span>
            {error}
          </div>
        )}

        {/* PROPERTY HERO */}

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
              PROPERTY LIVE
            </div>

            <h2>{hotel?.name || "My Hotel"}</h2>

            <div className="hotel-hero-location">
              <span>⌖</span>
              {hotel?.location || "Location unavailable"}
            </div>

            <p>
              {hotel?.description ||
                "Manage your property, reservations and hotel information from one place."}
            </p>

            <div className="hotel-hero-features">
              <span>
                <b>▣</b>
                {totalRooms} Rooms
              </span>

              <span>
                <b>✓</b>
                {availableRooms} Available
              </span>

              <span>
                <b>●</b>
                {occupiedRooms} Occupied
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

        {/* STATISTICS */}

        <section className="hotel-statistics">
          <div className="hotel-stat-card blue-card">
            <div className="hotel-stat-icon">▦</div>

            <div className="hotel-stat-content">
              <span>Total Bookings</span>
              <strong>{totalBookings}</strong>
              <small>All reservations</small>
            </div>
          </div>

          <div className="hotel-stat-card green-card">
            <div className="hotel-stat-icon">✓</div>

            <div className="hotel-stat-content">
              <span>Active Bookings</span>
              <strong>{activeBookings}</strong>
              <small>Currently staying</small>
            </div>
          </div>

          <div className="hotel-stat-card purple-card">
            <div className="hotel-stat-icon">$</div>

            <div className="hotel-stat-content">
              <span>Total Revenue</span>
              <strong>{formatCurrency(revenue)}</strong>
              <small>Confirmed bookings</small>
            </div>
          </div>

          <div className="hotel-stat-card orange-card">
            <div className="hotel-stat-icon">◔</div>

            <div className="hotel-stat-content">
              <span>Occupancy</span>
              <strong>{occupancyPercentage}%</strong>
              <small>
                {occupiedRooms} of {totalRooms} occupied
              </small>
            </div>
          </div>
        </section>

        {/* OCCUPANCY + TODAY */}

        <section className="hotel-overview-grid">
          <div className="hotel-occupancy-card dashboard-white-card">
            <div className="dashboard-card-header">
              <div>
                <span>ROOM PERFORMANCE</span>
                <h3>Today's Occupancy</h3>
              </div>

              <div className="occupancy-percent">{occupancyPercentage}%</div>
            </div>

            <div className="occupancy-bar">
              <div
                style={{
                  width: `${occupancyPercentage}%`,
                }}
              ></div>
            </div>

            <div className="occupancy-footer">
              <div>
                <span className="legend-dot occupied-dot"></span>
                Occupied
                <strong>{occupiedRooms}</strong>
              </div>

              <div>
                <span className="legend-dot available-dot"></span>
                Available
                <strong>{availableRooms}</strong>
              </div>

              <div>
                <span className="legend-dot reserved-dot"></span>
                Reserved
                <strong>{reservedRooms}</strong>
              </div>
            </div>
          </div>

          <div className="hotel-today-card dashboard-white-card">
            <div className="dashboard-card-header">
              <div>
                <span>TODAY</span>
                <h3>Daily Activity</h3>
              </div>

              <span className="today-date">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="today-activity-grid">
              <div className="activity-item">
                <div className="activity-icon checkin">↓</div>
                <div>
                  <strong>{todayCheckIns}</strong>
                  <span>Check-ins</span>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon checkout">↑</div>
                <div>
                  <strong>{todayCheckOuts}</strong>
                  <span>Check-outs</span>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon confirmed">✓</div>
                <div>
                  <strong>{confirmedBookings}</strong>
                  <span>Confirmed</span>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon cancelled">×</div>
                <div>
                  <strong>{cancelledBookings}</strong>
                  <span>Cancelled</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROOM MANAGEMENT */}

        <section className="hotel-room-management dashboard-white-card">
          <div className="dashboard-card-header room-header">
            <div>
              <span>ROOM MANAGEMENT</span>
              <h3>Manage Your Rooms</h3>
              <p>Keep track of room availability, pricing and status.</p>
            </div>

            <button className="add-room-button" onClick={openAddRoom}>
              <span>+</span>
              Add Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="hotel-empty-rooms">
              <div className="empty-room-icon">▣</div>

              <h4>No individual rooms yet</h4>

              <p>
                Add your rooms to manage room numbers, prices and availability.
              </p>

              <button onClick={openAddRoom}>+ Add Your First Room</button>
            </div>
          ) : (
            <div className="hotel-room-table-wrapper">
              <table className="hotel-room-table">
                <thead>
                  <tr>
                    <th>ROOM</th>
                    <th>TYPE</th>
                    <th>PRICE / NIGHT</th>
                    <th>STATUS</th>
                    <th>DESCRIPTION</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room) => {
                    const status = String(
                      room.status || "available",
                    ).toLowerCase();

                    return (
                      <tr key={room._id || room.id}>
                        <td>
                          <div className="room-number-cell">
                            <span>ROOM</span>
                            <strong>#{room.roomNumber}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="room-type">
                            {room.roomType || "Standard"}
                          </span>
                        </td>

                        <td>
                          <strong className="room-price">
                            {formatCurrency(room.price)}
                          </strong>
                        </td>

                        <td>
                          <span className={`room-status ${status}`}>
                            <i></i>
                            {status}
                          </span>
                        </td>

                        <td>
                          <span className="room-description">
                            {room.description || "No description"}
                          </span>
                        </td>

                        <td>
                          <div className="room-actions">
                            <button
                              className="room-edit-button"
                              onClick={() => openEditRoom(room)}
                            >
                              Edit
                            </button>

                            <button
                              className="room-delete-button"
                              onClick={() =>
                                handleDeleteRoom(room._id || room.id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* LOWER CONTENT */}

        <section className="hotel-dashboard-grid">
          <div className="hotel-reservations-card dashboard-white-card">
            <div className="dashboard-card-header">
              <div>
                <span>BOOKING ACTIVITY</span>
                <h3>Recent Reservations</h3>
              </div>

              <button onClick={() => navigate("/admin/hotel-bookings")}>
                View All →
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

                      const guestName = getGuestName(booking);

                      return (
                        <tr key={booking._id || booking.id}>
                          <td>
                            <div className="hotel-guest">
                              <div className="hotel-guest-avatar">
                                {getUserInitials(guestName)}
                              </div>

                              <div>
                                <strong>{guestName}</strong>
                                <span>{getGuestEmail(booking)}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            {formatDate(booking.createdAt || booking.checkIn)}
                          </td>

                          <td>
                            {Number(booking.rooms || 1)}{" "}
                            {Number(booking.rooms || 1) === 1
                              ? "Room"
                              : "Rooms"}
                          </td>

                          <td>
                            <strong className="hotel-booking-price">
                              {formatCurrency(booking.totalPrice)}
                            </strong>
                          </td>

                          <td>
                            <span className={`hotel-status ${status}`}>
                              <i></i>
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

          <div className="hotel-right-column">
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
                  ⌖ {hotel?.location || "Location unavailable"}
                </p>

                <div className="hotel-small-stats">
                  <span>▣ {totalRooms} Rooms</span>

                  <span>
                    ${Number(hotel?.price || 0).toLocaleString()}
                    /night
                  </span>
                </div>

                <p className="hotel-small-description">
                  {hotel?.description ||
                    "Your property information appears here."}
                </p>
              </div>
            </div>

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
                  <b>→</b>
                </button>

                <button onClick={openAddRoom}>
                  <span className="quick-icon orange">+</span>
                  <span>Add Room</span>
                  <b>→</b>
                </button>

                <button onClick={() => navigate("/admin/hotel-bookings")}>
                  <span className="quick-icon green">▦</span>
                  <span>Manage Bookings</span>
                  <b>→</b>
                </button>

                <button onClick={() => navigate("/")}>
                  <span className="quick-icon purple">★</span>
                  <span>View Website</span>
                  <b>→</b>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* EDIT PROPERTY MODAL */}

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
                <p>Update your hotel information and property details.</p>
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
                  />
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

      {/* ROOM MODAL */}

      {showRoomModal && (
        <div
          className="hotel-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowRoomModal(false);
            }
          }}
        >
          <div className="hotel-edit-modal room-modal">
            <div className="hotel-modal-header">
              <div>
                <span>ROOM MANAGEMENT</span>

                <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>

                <p>
                  {editingRoom
                    ? "Update the room information below."
                    : "Create a new room for your hotel."}
                </p>
              </div>

              <button
                className="hotel-modal-close"
                onClick={() => !saving && setShowRoomModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRoomSubmit}>
              <div className="hotel-form-grid">
                <div className="hotel-form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={roomForm.roomNumber}
                    onChange={handleRoomChange}
                    placeholder="Example: 101"
                    required
                  />
                </div>

                <div className="hotel-form-group">
                  <label>Room Type</label>

                  <select
                    name="roomType"
                    value={roomForm.roomType}
                    onChange={handleRoomChange}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div className="hotel-form-group">
                  <label>Price Per Night</label>

                  <input
                    type="number"
                    name="price"
                    value={roomForm.price}
                    onChange={handleRoomChange}
                    min="0"
                    required
                  />
                </div>

                <div className="hotel-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={roomForm.status}
                    onChange={handleRoomChange}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="hotel-form-group full">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={roomForm.description}
                    onChange={handleRoomChange}
                    rows="4"
                    placeholder="King bed, balcony, city view..."
                  />
                </div>
              </div>

              <div className="hotel-modal-actions">
                <button
                  type="button"
                  className="hotel-cancel-button"
                  onClick={() => !saving && setShowRoomModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hotel-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingRoom
                      ? "Update Room"
                      : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
