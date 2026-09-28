import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminDashboard.css";

const API_URL = "http://localhost:5000";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90";

const ROOM_AMENITIES = [
  "Wi-Fi",
  "TV",
  "Air Conditioning",
  "Mini Bar",
  "Private Bathroom",
  "Balcony",
  "Room Service",
  "Safe",
];

const getImage = (hotel) => {
  const image = hotel?.image;

  if (!image) return FALLBACK_IMAGE;

  if (typeof image === "string" && image.startsWith("http")) {
    return image;
  }

  if (typeof image === "string" && image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return `${API_URL}/uploads/${image}`;
};

const getUserInitials = (name = "Admin") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString()}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBookingStatus = (status) => {
  return String(status || "confirmed").toLowerCase();
};

const getGuestName = (booking) => {
  return booking?.user?.name || booking?.guestName || "Guest";
};

const getGuestEmail = (booking) => {
  return booking?.user?.email || booking?.guestEmail || "Guest booking";
};

const isSameDay = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const Icon = ({ type, size = 19 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    hotel: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
        <path d="M16 9h3a2 2 0 0 1 2 2v10" />
        <path d="M8 7h2M8 11h2M8 15h2M12 7h1M12 11h1M12 15h1" />
      </>
    ),

    rooms: (
      <>
        <path d="M3 20V10" />
        <path d="M3 15h18" />
        <path d="M21 20V8a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v7" />
        <path d="M6 15v5M18 15v5" />
        <path d="M6 10V8a2 2 0 0 1 2-2h3v4" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),

    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
      </>
    ),

    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6" />
        <path d="M6 7l1 14h10l1-14M9 7V4h6v3" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" />
        <path d="M3 4v6h6" />
        <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
        <path d="M21 20v-6h-6" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    money: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 9h.01M17 15h.01" />
      </>
    ),

    bed: (
      <>
        <path d="M3 20v-9" />
        <path d="M21 20v-9" />
        <path d="M3 16h18" />
        <path d="M6 16v4M18 16v4" />
        <path d="M3 11h18" />
        <path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    ),

    chevron: (
      <>
        <path d="m6 9 6 6 6-6" />
      </>
    ),

    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    star: (
      <>
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
      </>
    ),

    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
  };

  return <svg {...common}>{icons[type] || icons.info}</svg>;
};

function HotelAdminDashboard() {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    beds: 1,
    bedType: "Single",
    capacity: 2,
    roomSize: "",
    floor: 1,
    view: "City View",
    price: "",
    status: "available",
    amenities: [],
    description: "",
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const adminName = currentUser?.name || currentUser?.fullName || "Hotel Admin";

  const loadHotel = async () => {
    const response = await API.get("/hotels/my-hotel");

    const hotelData = response.data?.hotel || response.data;

    setHotel(hotelData);

    setFormData({
      name: hotelData?.name || "",
      location: hotelData?.location || "",
      description: hotelData?.description || "",
      price: hotelData?.price || "",
      rooms: hotelData?.rooms || "",
      image: hotelData?.image || "",
    });
  };

  const loadBookings = async () => {
    const response = await API.get("/bookings/my-hotel");

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.bookings || [];

    setBookings(data);
  };

  const loadRooms = async () => {
    const response = await API.get("/rooms/my-hotel");

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.rooms || [];

    setRooms(data);
  };

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      await Promise.all([loadHotel(), loadBookings(), loadRooms()]);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Unable to load your hotel dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const showSuccessMessage = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 3500);
  };

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter(
    (booking) => getBookingStatus(booking.status) === "confirmed",
  );

  const cancelledBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking.status);
    return status === "cancelled" || status === "canceled";
  });

  const activeBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking.status);

    if (status !== "confirmed") return false;

    const now = new Date();

    const checkIn = booking.checkIn ? new Date(booking.checkIn) : null;
    const checkOut = booking.checkOut ? new Date(booking.checkOut) : null;

    return checkIn && checkOut && now >= checkIn && now <= checkOut;
  });

  const todayCheckIns = bookings.filter((booking) =>
    isSameDay(booking.checkIn),
  );

  const todayCheckOuts = bookings.filter((booking) =>
    isSameDay(booking.checkOut),
  );

  const revenue = confirmedBookings.reduce(
    (total, booking) => total + Number(booking.totalPrice || 0),
    0,
  );

  const totalRooms = rooms.length || Number(hotel?.rooms || 0) || 0;

  const availableRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "available",
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "occupied",
  ).length;

  const reservedRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "reserved",
  ).length;

  const maintenanceRooms = rooms.filter((room) => {
    const status = String(room.status || "").toLowerCase();

    return status === "maintenance" || status === "out_of_service";
  }).length;

  const occupancyPercentage =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const totalBeds = rooms.reduce(
    (sum, room) => sum + Number(room.beds || 0),
    0,
  );

  const totalCapacity = rooms.reduce(
    (sum, room) => sum + Number(room.capacity || 0),
    0,
  );

  const availableBeds = rooms
    .filter((room) => String(room.status || "").toLowerCase() === "available")
    .reduce((sum, room) => sum + Number(room.beds || 0), 0);

  const averageRoomPrice =
    rooms.length > 0
      ? rooms.reduce((sum, room) => sum + Number(room.price || 0), 0) /
        rooms.length
      : Number(hotel?.price || 0);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const first = new Date(a.createdAt || a.checkIn || 0).getTime();
        const second = new Date(b.createdAt || b.checkIn || 0).getTime();

        return second - first;
      })
      .slice(0, 6);
  }, [bookings]);

  const handleEditHotel = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price: Number(formData.price || 0),
        rooms: Number(formData.rooms || 0),
        image: formData.image,
      };

      const response = await API.put("/hotels/my-hotel", payload);

      const updatedHotel = response.data?.hotel || response.data;

      setHotel(updatedHotel);

      setFormData({
        name: updatedHotel?.name || formData.name,
        location: updatedHotel?.location || formData.location,
        description: updatedHotel?.description || formData.description,
        price: updatedHotel?.price ?? formData.price,
        rooms: updatedHotel?.rooms ?? formData.rooms,
        image: updatedHotel?.image || formData.image,
      });

      setShowEditModal(false);

      showSuccessMessage("Property details updated successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Unable to update property details.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetRoomForm = () => {
    setRoomForm({
      roomNumber: "",
      roomType: "Standard",
      beds: 1,
      bedType: "Single",
      capacity: 2,
      roomSize: "",
      floor: 1,
      view: "City View",
      price: "",
      status: "available",
      amenities: [],
      description: "",
    });

    setEditingRoom(null);
  };

  const openAddRoom = () => {
    resetRoomForm();
    setShowRoomModal(true);
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);

    setRoomForm({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "Standard",
      beds: room.beds || 1,
      bedType: room.bedType || "Single",
      capacity: room.capacity || 2,
      roomSize: room.roomSize || "",
      floor: room.floor || 1,
      view: room.view || "City View",
      price: room.price || "",
      status: room.status || "available",
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      description: room.description || "",
    });

    setShowRoomModal(true);
  };

  const handleRoomChange = (event) => {
    const { name, value } = event.target;

    setRoomForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    setRoomForm((previous) => {
      const exists = previous.amenities.includes(amenity);

      return {
        ...previous,
        amenities: exists
          ? previous.amenities.filter((item) => item !== amenity)
          : [...previous.amenities, amenity],
      };
    });
  };

  const handleSaveRoom = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        roomNumber: roomForm.roomNumber,
        roomType: roomForm.roomType,
        beds: Number(roomForm.beds || 1),
        bedType: roomForm.bedType,
        capacity: Number(roomForm.capacity || 1),
        roomSize: roomForm.roomSize,
        floor: Number(roomForm.floor || 1),
        view: roomForm.view,
        price: Number(roomForm.price || 0),
        status: roomForm.status,
        amenities: roomForm.amenities,
        description: roomForm.description,
      };

      if (editingRoom?._id) {
        await API.put(`/rooms/${editingRoom._id}`, payload);
        showSuccessMessage("Room updated successfully.");
      } else {
        await API.post("/rooms", payload);
        showSuccessMessage("New room added successfully.");
      }

      setShowRoomModal(false);
      resetRoomForm();

      await loadRooms();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Unable to save the room.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await API.delete(`/rooms/${roomId}`);

      showSuccessMessage("Room deleted successfully.");

      await loadRooms();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Unable to delete the room.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleViewWebsite = () => {
    navigate("/");
  };

  const getRoomStatusClass = (status) => {
    const normalized = String(status || "available").toLowerCase();

    if (normalized === "occupied") return "occupied";
    if (normalized === "reserved") return "reserved";
    if (normalized === "maintenance" || normalized === "out_of_service") {
      return "maintenance";
    }

    return "available";
  };

  if (loading) {
    return (
      <div className="hotel-dashboard-loading">
        <div className="dashboard-loading-card">
          <div className="dashboard-spinner" />
          <h2>Preparing your dashboard</h2>
          <p>Loading property information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-admin-dashboard">
      {/* SIDEBAR */}
      <aside className="hotel-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span>S</span>
          </div>

          <div>
            <strong>Stayora</strong>
            <span>HOTEL MANAGEMENT</span>
          </div>
        </div>

        <div className="sidebar-section-label">Workspace</div>

        <nav className="hotel-sidebar-nav">
          <button className="hotel-nav-item active">
            <Icon type="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            className="hotel-nav-item"
            onClick={() =>
              document
                .getElementById("property")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Icon type="hotel" />
            <span>My Property</span>
          </button>

          <button
            className="hotel-nav-item"
            onClick={() =>
              document
                .getElementById("rooms")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Icon type="rooms" />
            <span>Rooms</span>
          </button>

          <button
            className="hotel-nav-item"
            onClick={() =>
              document
                .getElementById("reservations")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Icon type="calendar" />
            <span>Reservations</span>
          </button>
        </nav>

        <div className="sidebar-section-label property-label">Property</div>

        <nav className="hotel-sidebar-nav">
          <button
            className="hotel-nav-item"
            onClick={() => setShowEditModal(true)}
          >
            <Icon type="edit" />
            <span>Property Details</span>
          </button>

          <button className="hotel-nav-item" onClick={handleViewWebsite}>
            <Icon type="globe" />
            <span>Visit Website</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">{getUserInitials(adminName)}</div>

            <div className="sidebar-profile-info">
              <strong>{adminName}</strong>
              <span>Property Manager</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <Icon type="logout" size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hotel-dashboard-main">
        <header className="hotel-dashboard-header">
          <div>
            <span className="dashboard-kicker">HOTEL OPERATIONS</span>

            <h1>
              Good day, <strong>{adminName.split(" ")[0]}</strong>
            </h1>

            <p>Here's what's happening with your property today.</p>
          </div>

          <div className="dashboard-header-actions">
            <button
              className="dashboard-refresh-button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              <Icon type="refresh" size={18} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="dashboard-website-button"
              onClick={handleViewWebsite}
            >
              <Icon type="globe" size={18} />
              View Website
            </button>

            <button className="dashboard-notification-button">
              <Icon type="bell" size={20} />
              <span />
            </button>

            <div className="dashboard-header-avatar">
              {getUserInitials(adminName)}
            </div>
          </div>
        </header>

        {/* ALERTS */}
        {success && (
          <div className="dashboard-alert success-alert">
            <div className="alert-icon">
              <Icon type="check" size={17} />
            </div>
            <span>{success}</span>

            <button onClick={() => setSuccess("")}>
              <Icon type="close" size={16} />
            </button>
          </div>
        )}

        {error && (
          <div className="dashboard-alert error-alert">
            <div className="alert-icon">
              <Icon type="info" size={17} />
            </div>
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <Icon type="close" size={16} />
            </button>
          </div>
        )}

        {/* PROPERTY HERO */}
        <section
          className="hotel-property-hero"
          id="property"
          style={{
            backgroundImage: `url("${getImage(hotel)}")`,
          }}
        >
          <div className="property-hero-overlay" />

          <div className="property-hero-content">
            <div className="property-hero-top">
              <div className="live-property-badge">
                <span />
                Property Live
              </div>

              <button
                className="hero-edit-button"
                onClick={() => setShowEditModal(true)}
              >
                <Icon type="edit" size={17} />
                Edit Property
              </button>
            </div>

            <div className="property-hero-details">
              <div className="property-rating">
                <Icon type="star" size={15} />
                <span>{hotel?.rating || "4.8"}</span>
                <small>Guest rating</small>
              </div>

              <h2>{hotel?.name || "Your Hotel"}</h2>

              <div className="property-location">
                <Icon type="location" size={17} />
                {hotel?.location || "Property location"}
              </div>

              <p>
                {hotel?.description ||
                  "Manage your rooms, reservations and property performance from one place."}
              </p>
            </div>

            <div className="property-quick-stats">
              <div>
                <strong>{totalRooms}</strong>
                <span>Total rooms</span>
              </div>

              <div>
                <strong>{availableRooms}</strong>
                <span>Available</span>
              </div>

              <div>
                <strong>{occupiedRooms}</strong>
                <span>Occupied</span>
              </div>

              <div>
                <strong>{totalBeds}</strong>
                <span>Total beds</span>
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="hotel-statistics">
          <div className="hotel-stat-card bookings-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon type="calendar" />
              </div>

              <span className="stat-period">ALL TIME</span>
            </div>

            <span className="stat-label">Total bookings</span>
            <strong>{totalBookings}</strong>

            <div className="stat-footer">
              <span className="stat-positive">
                {confirmedBookings.length} confirmed
              </span>
              <Icon type="arrow" size={15} />
            </div>
          </div>

          <div className="hotel-stat-card guests-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon type="users" />
              </div>

              <span className="stat-period">LIVE</span>
            </div>

            <span className="stat-label">Active guests</span>
            <strong>{activeBookings.length}</strong>

            <div className="stat-footer">
              <span>{todayCheckIns.length} check-ins today</span>
              <Icon type="arrow" size={15} />
            </div>
          </div>

          <div className="hotel-stat-card revenue-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon type="money" />
              </div>

              <span className="stat-period">CONFIRMED</span>
            </div>

            <span className="stat-label">Total revenue</span>
            <strong>{formatCurrency(revenue)}</strong>

            <div className="stat-footer">
              <span>From confirmed bookings</span>
              <Icon type="arrow" size={15} />
            </div>
          </div>

          <div className="hotel-stat-card occupancy-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon type="hotel" />
              </div>

              <span className="stat-period">TODAY</span>
            </div>

            <span className="stat-label">Occupancy</span>
            <strong>{occupancyPercentage}%</strong>

            <div className="stat-footer">
              <div className="mini-progress">
                <span style={{ width: `${occupancyPercentage}%` }} />
              </div>
              <span>{occupiedRooms} rooms</span>
            </div>
          </div>
        </section>

        {/* ROOM SUMMARY */}
        <section className="hotel-room-statistics">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">PROPERTY CAPACITY</span>
              <h2>Room overview</h2>
            </div>

            <button
              className="section-link"
              onClick={() =>
                document
                  .getElementById("rooms")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Manage rooms
              <Icon type="arrow" size={15} />
            </button>
          </div>

          <div className="room-summary-grid">
            <div className="room-summary-card">
              <div className="room-summary-icon">
                <Icon type="bed" />
              </div>

              <div>
                <span>Total beds</span>
                <strong>{totalBeds}</strong>
              </div>
            </div>

            <div className="room-summary-card">
              <div className="room-summary-icon">
                <Icon type="users" />
              </div>

              <div>
                <span>Guest capacity</span>
                <strong>{totalCapacity}</strong>
              </div>
            </div>

            <div className="room-summary-card">
              <div className="room-summary-icon">
                <Icon type="check" />
              </div>

              <div>
                <span>Available beds</span>
                <strong>{availableBeds}</strong>
              </div>
            </div>

            <div className="room-summary-card">
              <div className="room-summary-icon">
                <Icon type="money" />
              </div>

              <div>
                <span>Average room rate</span>
                <strong>{formatCurrency(averageRoomPrice)}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <section className="hotel-overview-grid">
          <div className="dashboard-panel occupancy-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">ROOM STATUS</span>
                <h3>Occupancy overview</h3>
              </div>

              <span className="panel-date">Live</span>
            </div>

            <div className="occupancy-content">
              <div
                className="occupancy-circle"
                style={{
                  "--occupancy": `${occupancyPercentage}%`,
                }}
              >
                <div>
                  <strong>{occupancyPercentage}%</strong>
                  <span>occupied</span>
                </div>
              </div>

              <div className="occupancy-breakdown">
                <div className="occupancy-row">
                  <span>
                    <i className="status-dot available" />
                    Available
                  </span>
                  <strong>{availableRooms}</strong>
                </div>

                <div className="occupancy-row">
                  <span>
                    <i className="status-dot occupied" />
                    Occupied
                  </span>
                  <strong>{occupiedRooms}</strong>
                </div>

                <div className="occupancy-row">
                  <span>
                    <i className="status-dot reserved" />
                    Reserved
                  </span>
                  <strong>{reservedRooms}</strong>
                </div>

                <div className="occupancy-row">
                  <span>
                    <i className="status-dot maintenance" />
                    Maintenance
                  </span>
                  <strong>{maintenanceRooms}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel today-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">TODAY</span>
                <h3>Daily overview</h3>
              </div>

              <div className="today-calendar">
                <Icon type="calendar" size={17} />
              </div>
            </div>

            <div className="today-overview-list">
              <div className="today-overview-item">
                <div className="today-item-icon check-in">
                  <Icon type="arrow" size={17} />
                </div>

                <div>
                  <strong>{todayCheckIns.length}</strong>
                  <span>Check-ins</span>
                </div>

                <small>Arrivals</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon check-out">
                  <Icon type="arrow" size={17} />
                </div>

                <div>
                  <strong>{todayCheckOuts.length}</strong>
                  <span>Check-outs</span>
                </div>

                <small>Departures</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon confirmed">
                  <Icon type="check" size={17} />
                </div>

                <div>
                  <strong>{confirmedBookings.length}</strong>
                  <span>Confirmed</span>
                </div>

                <small>Bookings</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon cancelled">
                  <Icon type="close" size={17} />
                </div>

                <div>
                  <strong>{cancelledBookings.length}</strong>
                  <span>Cancelled</span>
                </div>

                <small>Bookings</small>
              </div>
            </div>
          </div>
        </section>

        {/* ROOMS */}
        <section className="hotel-room-management dashboard-panel" id="rooms">
          <div className="room-management-header">
            <div>
              <span className="panel-eyebrow">INVENTORY</span>
              <h2>Room management</h2>
              <p>Manage your property's rooms, rates and availability.</p>
            </div>

            <button className="primary-action-button" onClick={openAddRoom}>
              <Icon type="plus" size={18} />
              Add Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="room-empty-state">
              <div className="empty-state-icon">
                <Icon type="rooms" size={30} />
              </div>

              <h3>No rooms added yet</h3>

              <p>
                Add your first room to start managing inventory and
                availability.
              </p>

              <button className="primary-action-button" onClick={openAddRoom}>
                <Icon type="plus" size={18} />
                Add Your First Room
              </button>
            </div>
          ) : (
            <div className="hotel-room-table-wrapper">
              <table className="hotel-room-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Type</th>
                    <th>Beds</th>
                    <th>Capacity</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room) => (
                    <tr key={room._id || room.id}>
                      <td>
                        <div className="room-number-cell">
                          <div className="room-number-icon">
                            <Icon type="bed" size={17} />
                          </div>

                          <div>
                            <strong>{room.roomNumber || "—"}</strong>
                            <span>Floor {room.floor || "—"}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="room-type">
                          {room.roomType || "Standard"}
                        </span>
                      </td>

                      <td>
                        <span className="table-value">
                          {room.beds || 0}
                          <small>
                            {room.bedType ? ` ${room.bedType}` : ""}
                          </small>
                        </span>
                      </td>

                      <td>
                        <span className="table-value">
                          {room.capacity || 0}
                          <small> guests</small>
                        </span>
                      </td>

                      <td>
                        <strong className="room-price">
                          {formatCurrency(room.price)}
                        </strong>
                        <small className="price-night">/night</small>
                      </td>

                      <td>
                        <span
                          className={`room-status ${getRoomStatusClass(
                            room.status,
                          )}`}
                        >
                          <i />
                          {room.status || "Available"}
                        </span>
                      </td>

                      <td>
                        <div className="room-details-cell">
                          {room.roomSize && <span>{room.roomSize}</span>}
                          {room.view && <span>{room.view}</span>}
                        </div>
                      </td>

                      <td>
                        <div className="room-actions">
                          <button
                            className="room-action edit"
                            onClick={() => openEditRoom(room)}
                            title="Edit room"
                          >
                            <Icon type="edit" size={16} />
                          </button>

                          <button
                            className="room-action delete"
                            onClick={() =>
                              handleDeleteRoom(room._id || room.id)
                            }
                            title="Delete room"
                          >
                            <Icon type="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* BOOKINGS + PROPERTY CARD */}
        <section className="hotel-dashboard-grid">
          <div
            className="dashboard-panel recent-bookings-panel"
            id="reservations"
          >
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">RESERVATIONS</span>
                <h3>Recent bookings</h3>
              </div>

              <span className="booking-count">{totalBookings} total</span>
            </div>

            {recentBookings.length === 0 ? (
              <div className="booking-empty">
                <div className="empty-state-icon small">
                  <Icon type="calendar" size={23} />
                </div>

                <h4>No bookings yet</h4>
                <p>Your recent reservations will appear here.</p>
              </div>
            ) : (
              <div className="recent-bookings-list">
                {recentBookings.map((booking) => {
                  const status = getBookingStatus(booking.status);

                  return (
                    <div
                      className="recent-booking-item"
                      key={booking._id || booking.id}
                    >
                      <div className="guest-avatar">
                        {getUserInitials(getGuestName(booking))}
                      </div>

                      <div className="guest-info">
                        <strong>{getGuestName(booking)}</strong>
                        <span>{getGuestEmail(booking)}</span>
                      </div>

                      <div className="booking-dates">
                        <span>{formatDate(booking.checkIn)}</span>
                        <small>to</small>
                        <span>{formatDate(booking.checkOut)}</span>
                      </div>

                      <div className="booking-price">
                        {formatCurrency(booking.totalPrice)}
                      </div>

                      <span className={`booking-status ${status}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="dashboard-right-column">
            <div className="dashboard-panel property-summary-card">
              <div className="property-summary-image">
                <img
                  src={getImage(hotel)}
                  alt={hotel?.name || "Hotel"}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />

                <span>
                  <Icon type="star" size={13} />
                  {hotel?.rating || "4.8"}
                </span>
              </div>

              <div className="property-summary-content">
                <span className="panel-eyebrow">YOUR PROPERTY</span>

                <h3>{hotel?.name || "Your Hotel"}</h3>

                <p>
                  <Icon type="location" size={15} />
                  {hotel?.location || "Location not set"}
                </p>

                <button
                  className="outline-action-button"
                  onClick={() => setShowEditModal(true)}
                >
                  Manage Property
                  <Icon type="arrow" size={15} />
                </button>
              </div>
            </div>

            <div className="dashboard-panel quick-actions-card">
              <div className="panel-header">
                <div>
                  <span className="panel-eyebrow">SHORTCUTS</span>
                  <h3>Quick actions</h3>
                </div>
              </div>

              <div className="quick-actions-grid">
                <button onClick={openAddRoom}>
                  <div>
                    <Icon type="plus" size={18} />
                  </div>
                  <span>Add room</span>
                </button>

                <button onClick={() => setShowEditModal(true)}>
                  <div>
                    <Icon type="edit" size={18} />
                  </div>
                  <span>Edit property</span>
                </button>

                <button onClick={handleViewWebsite}>
                  <div>
                    <Icon type="globe" size={18} />
                  </div>
                  <span>View website</span>
                </button>

                <button
                  onClick={() =>
                    document.getElementById("reservations")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  <div>
                    <Icon type="calendar" size={18} />
                  </div>
                  <span>Bookings</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="hotel-dashboard-footer">
          <span>Stayora Hotel Management</span>
          <span>•</span>
          <span>Property Dashboard</span>
          <span>•</span>
          <span>All systems operational</span>
        </footer>
      </main>

      {/* EDIT PROPERTY MODAL */}
      {showEditModal && (
        <div
          className="hotel-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="hotel-edit-modal property-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">PROPERTY SETTINGS</span>
                <h2>Edit Property</h2>
                <p>Update the information guests see about your hotel.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <Icon type="close" />
              </button>
            </div>

            <form onSubmit={handleEditHotel}>
              <div className="modal-form-grid">
                <label>
                  <span>Hotel name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter hotel name"
                    required
                  />
                </label>

                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        location: event.target.value,
                      })
                    }
                    placeholder="Add property location"
                    required
                  />
                </label>

                <label>
                  <span>Starting price</span>
                  <div className="input-with-prefix">
                    <span>$</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          price: event.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </label>

                <label>
                  <span>Total rooms</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.rooms}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        rooms: event.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </label>
              </div>

              <label className="full-width-field">
                <span>Image URL</span>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      image: event.target.value,
                    })
                  }
                  placeholder="https://example.com/hotel-image.jpg"
                />
              </label>

              <label className="full-width-field">
                <span>Description</span>
                <textarea
                  rows="5"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      description: event.target.value,
                    })
                  }
                  placeholder="Tell guests about your property..."
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-modal-button"
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
            if (event.target === event.currentTarget) {
              setShowRoomModal(false);
            }
          }}
        >
          <div className="hotel-edit-modal room-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">ROOM INVENTORY</span>

                <h2>{editingRoom ? "Edit Room" : "Add New Room"}</h2>

                <p>Set the room details, pricing and availability.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowRoomModal(false)}
              >
                <Icon type="close" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom}>
              <div className="room-form-section">
                <div className="room-form-section-title">
                  <span>01</span>
                  <div>
                    <strong>Room information</strong>
                    <small>Basic room details</small>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <label>
                    <span>Room number</span>
                    <input
                      name="roomNumber"
                      value={roomForm.roomNumber}
                      onChange={handleRoomChange}
                      placeholder="e.g. 204"
                      required
                    />
                  </label>

                  <label>
                    <span>Room type</span>
                    <select
                      name="roomType"
                      value={roomForm.roomType}
                      onChange={handleRoomChange}
                    >
                      <option>Standard</option>
                      <option>Deluxe</option>
                      <option>Executive</option>
                      <option>Suite</option>
                      <option>Presidential Suite</option>
                      <option>Family Room</option>
                    </select>
                  </label>

                  <label>
                    <span>Floor</span>
                    <input
                      type="number"
                      min="1"
                      name="floor"
                      value={roomForm.floor}
                      onChange={handleRoomChange}
                    />
                  </label>

                  <label>
                    <span>Room size</span>
                    <input
                      name="roomSize"
                      value={roomForm.roomSize}
                      onChange={handleRoomChange}
                      placeholder="e.g. 32 m²"
                    />
                  </label>
                </div>
              </div>

              <div className="room-form-section">
                <div className="room-form-section-title">
                  <span>02</span>
                  <div>
                    <strong>Bed & capacity</strong>
                    <small>Sleeping arrangements</small>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <label>
                    <span>Number of beds</span>
                    <input
                      type="number"
                      min="1"
                      name="beds"
                      value={roomForm.beds}
                      onChange={handleRoomChange}
                    />
                  </label>

                  <label>
                    <span>Bed type</span>
                    <select
                      name="bedType"
                      value={roomForm.bedType}
                      onChange={handleRoomChange}
                    >
                      <option>Single</option>
                      <option>Double</option>
                      <option>Queen</option>
                      <option>King</option>
                      <option>Twin</option>
                      <option>Bunk</option>
                    </select>
                  </label>

                  <label>
                    <span>Guest capacity</span>
                    <input
                      type="number"
                      min="1"
                      name="capacity"
                      value={roomForm.capacity}
                      onChange={handleRoomChange}
                    />
                  </label>

                  <label>
                    <span>View</span>
                    <select
                      name="view"
                      value={roomForm.view}
                      onChange={handleRoomChange}
                    >
                      <option>City View</option>
                      <option>Garden View</option>
                      <option>Pool View</option>
                      <option>Mountain View</option>
                      <option>Ocean View</option>
                      <option>Hotel View</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="room-form-section">
                <div className="room-form-section-title">
                  <span>03</span>
                  <div>
                    <strong>Pricing & status</strong>
                    <small>Room availability</small>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <label>
                    <span>Nightly price</span>

                    <div className="input-with-prefix">
                      <span>$</span>

                      <input
                        type="number"
                        min="0"
                        name="price"
                        value={roomForm.price}
                        onChange={handleRoomChange}
                        placeholder="0"
                        required
                      />
                    </div>
                  </label>

                  <label>
                    <span>Status</span>
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
                  </label>
                </div>
              </div>

              <div className="room-form-section">
                <div className="room-form-section-title">
                  <span>04</span>
                  <div>
                    <strong>Amenities</strong>
                    <small>What guests can expect</small>
                  </div>
                </div>

                <div className="amenities-grid">
                  {ROOM_AMENITIES.map((amenity) => {
                    const selected = roomForm.amenities.includes(amenity);

                    return (
                      <button
                        type="button"
                        key={amenity}
                        className={`amenity-option ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        <span>
                          {selected && <Icon type="check" size={14} />}
                        </span>

                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="room-form-section">
                <div className="room-form-section-title">
                  <span>05</span>
                  <div>
                    <strong>Description</strong>
                    <small>Additional room information</small>
                  </div>
                </div>

                <label className="full-width-field">
                  <span>Room description</span>
                  <textarea
                    rows="4"
                    name="description"
                    value={roomForm.description}
                    onChange={handleRoomChange}
                    placeholder="Describe this room for your guests..."
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-button"
                  onClick={() => {
                    setShowRoomModal(false);
                    resetRoomForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-modal-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingRoom
                      ? "Update Room"
                      : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelAdminDashboard;
