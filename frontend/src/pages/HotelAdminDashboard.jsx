import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdminDashboard.css";

const API_URL = "http://localhost:5000";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1600&q=85";

const ROOM_AMENITIES = [
  "Wi-Fi",
  "Air Conditioning",
  "TV",
  "Mini Bar",
  "Safe",
  "Balcony",
  "Breakfast",
  "Parking",
  "Room Service",
  "Desk",
  "Bathtub",
  "Hair Dryer",
];

/* =========================================================
   ICONS
========================================================= */

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
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
        <path d="M5 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M9 7h2" />
        <path d="M13 7h2" />
        <path d="M9 11h2" />
        <path d="M13 11h2" />
        <path d="M9 15h2" />
        <path d="M13 15h2" />
        <path d="M9 21v-3h4v3" />
      </>
    ),

    rooms: (
      <>
        <path d="M3 18v-7a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v6" />
        <path d="M3 15h17a2 2 0 0 1 2 2v1" />
        <path d="M5 18v3" />
        <path d="M19 18v3" />
        <path d="M7 9V7a2 2 0 0 1 2-2h2" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
      </>
    ),

    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a14 14 0 0 1 0 18" />
        <path d="M12 3a14 14 0 0 0 0 18" />
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
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
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
        <path d="M3 5v5h5" />
        <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),

    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    money: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M7 9h.01" />
        <path d="M17 15h.01" />
      </>
    ),

    bed: (
      <>
        <path d="M3 19v-8" />
        <path d="M3 15h18v4" />
        <path d="M6 15V8a2 2 0 0 1 2-2h3a3 3 0 0 1 3 3v6" />
        <path d="M3 19v2" />
        <path d="M21 19v2" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    close: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
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
      <path
        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"
        fill="currentColor"
        stroke="none"
      />
    ),

    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.info}</svg>;
};

/* =========================================================
   HELPERS
========================================================= */

const getImage = (image) => {
  if (!image) return FALLBACK_HERO;

  const value = String(image);

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${API_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getUserInitials = (name = "Hotel Admin") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "HA";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBookingStatus = (booking) => {
  const status =
    booking?.status ||
    booking?.bookingStatus ||
    booking?.paymentStatus ||
    "pending";

  return String(status).toLowerCase().replace(/\s+/g, "-");
};

const getGuestName = (booking) => {
  return (
    booking?.guest?.name ||
    booking?.user?.name ||
    booking?.customer?.name ||
    booking?.guestName ||
    booking?.name ||
    "Guest"
  );
};

const getGuestEmail = (booking) => {
  return (
    booking?.guest?.email ||
    booking?.user?.email ||
    booking?.customer?.email ||
    booking?.guestEmail ||
    booking?.email ||
    "No email"
  );
};

const isSameDay = (date) => {
  if (!date) return false;

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return false;

  const today = new Date();

  return (
    value.getFullYear() === today.getFullYear() &&
    value.getMonth() === today.getMonth() &&
    value.getDate() === today.getDate()
  );
};

const normalizeHotelArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.hotels)) {
    return data.hotels;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const normalizeBookingArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.bookings)) {
    return data.bookings;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const normalizeRoomArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.rooms)) {
    return data.rooms;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/* =========================================================
   DASHBOARD
========================================================= */

const HotelAdminDashboard = () => {
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

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const adminName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email?.split("@")[0] ||
    "Property Manager";

  /* =======================================================
     LOAD HOTEL
     
     IMPORTANT:
     We use GET /hotels because this endpoint is confirmed
     to work in your backend.
     
     Then we find the hotel belonging to the logged-in user.
  ======================================================= */

  const loadHotel = async () => {
    try {
      const response = await API.get("/hotels");

      const hotels = normalizeHotelArray(response);

      let user = null;

      try {
        user = JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        user = null;
      }

      const userId = String(user?._id || user?.id || user?.userId || "").trim();

      const userEmail = String(user?.email || "")
        .trim()
        .toLowerCase();

      const myHotel =
        hotels.find((item) => {
          const hotelAdminId = String(
            item?.hotelAdmin?._id ||
              item?.hotelAdmin?.id ||
              item?.createdBy?._id ||
              item?.createdBy?.id ||
              "",
          ).trim();

          const hotelAdminEmail = String(
            item?.hotelAdmin?.email || item?.createdBy?.email || "",
          )
            .trim()
            .toLowerCase();

          const matchesId =
            Boolean(userId) && Boolean(hotelAdminId) && hotelAdminId === userId;

          const matchesEmail =
            Boolean(userEmail) &&
            Boolean(hotelAdminEmail) &&
            hotelAdminEmail === userEmail;

          return matchesId || matchesEmail;
        }) || null;

      if (!myHotel) {
        setHotel(null);

        setFormData({
          name: "",
          location: "",
          description: "",
          price: "",
          rooms: "",
          image: "",
        });

        return null;
      }

      setHotel(myHotel);

      setFormData({
        name: myHotel.name || "",
        location: myHotel.location || "",
        description: myHotel.description || "",
        price: myHotel.price ?? "",
        rooms: myHotel.rooms ?? "",
        image: myHotel.image || "",
      });

      return myHotel;
    } catch (requestError) {
      console.error("Could not load hotel:", requestError);

      throw requestError;
    }
  };

  /* =======================================================
     LOAD BOOKINGS
  ======================================================= */

  const loadBookings = async () => {
    try {
      const response = await API.get("/bookings/my-hotel");

      setBookings(normalizeBookingArray(response));
    } catch (requestError) {
      console.error("Could not load hotel bookings:", requestError);

      setBookings([]);
    }
  };

  /* =======================================================
     LOAD ROOMS
  ======================================================= */

  const loadRooms = async () => {
    try {
      const response = await API.get("/rooms/my-hotel");

      setRooms(normalizeRoomArray(response));
    } catch (requestError) {
      console.error("Could not load hotel rooms:", requestError);

      setRooms([]);
    }
  };

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadDashboard = async () => {
    setError("");

    try {
      await Promise.all([loadHotel(), loadBookings(), loadRooms()]);
    } catch (requestError) {
      console.error("Dashboard loading error:", requestError);

      const status = requestError?.response?.status;

      if (status === 401 || status === 403) {
        setError(
          "You do not have permission to manage this property. Please sign in with a hotel administrator account.",
        );
      } else {
        setError(
          requestError?.response?.data?.message ||
            "Unable to load your hotel dashboard.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =======================================================
     BOOKING CALCULATIONS
  ======================================================= */

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking);

    return ["confirmed", "completed", "checked-in", "checked-out"].includes(
      status,
    );
  });

  const cancelledBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking);

    return status === "cancelled" || status === "canceled";
  });

  const activeBookings = bookings.filter((booking) => {
    const status = getBookingStatus(booking);

    return ["confirmed", "checked-in", "pending"].includes(status);
  });

  const todayCheckIns = bookings.filter((booking) => {
    const checkIn =
      booking?.checkIn ||
      booking?.checkInDate ||
      booking?.startDate ||
      booking?.arrivalDate;

    return (
      isSameDay(checkIn) &&
      !["cancelled", "canceled"].includes(getBookingStatus(booking))
    );
  });

  const todayCheckOuts = bookings.filter((booking) => {
    const checkOut =
      booking?.checkOut ||
      booking?.checkOutDate ||
      booking?.endDate ||
      booking?.departureDate;

    return (
      isSameDay(checkOut) &&
      !["cancelled", "canceled"].includes(getBookingStatus(booking))
    );
  });

  const revenue = useMemo(() => {
    return bookings.reduce((total, booking) => {
      const amount =
        booking?.totalPrice ??
        booking?.totalAmount ??
        booking?.amount ??
        booking?.price ??
        0;

      return total + Number(amount || 0);
    }, 0);
  }, [bookings]);

  /* =======================================================
     ROOM CALCULATIONS
  ======================================================= */

  const totalRooms = Number(hotel?.rooms || rooms.length || 0);

  const availableRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "available",
  ).length;

  const occupiedRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "occupied",
  ).length;

  const reservedRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "reserved",
  ).length;

  const maintenanceRooms = rooms.filter(
    (room) => String(room.status || "").toLowerCase() === "maintenance",
  ).length;

  const calculatedRoomCount =
    rooms.length > 0 ? rooms.length : Number(hotel?.rooms || 0);

  const occupancyPercentage =
    calculatedRoomCount > 0
      ? Math.min(
          100,
          Math.round(
            ((occupiedRooms + reservedRooms) / calculatedRoomCount) * 100,
          ),
        )
      : 0;

  const totalBeds = rooms.reduce(
    (total, room) => total + Number(room.beds || 0),
    0,
  );

  const totalCapacity = rooms.reduce(
    (total, room) => total + Number(room.capacity || 0),
    0,
  );

  const availableBeds = rooms
    .filter((room) => String(room.status || "").toLowerCase() === "available")
    .reduce((total, room) => total + Number(room.beds || 0), 0);

  const averageRoomPrice =
    rooms.length > 0
      ? rooms.reduce((total, room) => total + Number(room.price || 0), 0) /
        rooms.length
      : Number(hotel?.price || 0);

  /* =======================================================
     RECENT BOOKINGS
  ======================================================= */

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const aDate = new Date(a?.createdAt || a?.checkIn || 0).getTime();

        const bDate = new Date(b?.createdAt || b?.checkIn || 0).getTime();

        return bDate - aDate;
      })
      .slice(0, 6);
  }, [bookings]);

  /* =======================================================
     EDIT HOTEL
  ======================================================= */

  const openEditModal = () => {
    if (!hotel) return;

    setFormData({
      name: hotel.name || "",
      location: hotel.location || "",
      description: hotel.description || "",
      price: hotel.price ?? "",
      rooms: hotel.rooms ?? "",
      image: hotel.image || "",
    });

    setShowEditModal(true);
  };

  const handleEditHotel = async (event) => {
    event.preventDefault();

    if (!hotel?._id) {
      setError("Hotel information is not available.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Hotel name is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Hotel location is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Hotel description is required.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Hotel price cannot be negative.");
      return;
    }

    if (Number(formData.rooms) < 1) {
      setError("The hotel must have at least one room.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      /*
       * IMPORTANT:
       * Update the actual hotel using its ID.
       * This avoids the broken /hotels/my-hotel endpoint.
       */

      const response = await API.put(`/hotels/${hotel._id}`, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        rooms: Number(formData.rooms),
        image: formData.image.trim(),
      });

      const updatedHotel = response?.data?.hotel || response?.data;

      if (updatedHotel) {
        setHotel(updatedHotel);

        setFormData({
          name: updatedHotel.name || "",
          location: updatedHotel.location || "",
          description: updatedHotel.description || "",
          price: updatedHotel.price ?? "",
          rooms: updatedHotel.rooms ?? "",
          image: updatedHotel.image || "",
        });
      }

      setShowEditModal(false);

      setSuccess("Property details updated successfully.");

      /*
       * Reload from backend so the dashboard always
       * shows the real saved data.
       */
      await loadHotel();
    } catch (requestError) {
      console.error("Could not update property:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to update your property.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ROOM FORM
  ======================================================= */

  const resetRoomForm = () => {
    setEditingRoom(null);

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
  };

  const openAddRoomModal = () => {
    resetRoomForm();
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);

    setRoomForm({
      roomNumber: room?.roomNumber || room?.number || "",
      roomType: room?.roomType || "Standard",
      beds: room?.beds ?? 1,
      bedType: room?.bedType || "Single",
      capacity: room?.capacity ?? 2,
      roomSize: room?.roomSize ?? "",
      floor: room?.floor ?? 1,
      view: room?.view || "City View",
      price: room?.price ?? "",
      status: room?.status || "available",
      amenities: Array.isArray(room?.amenities) ? room.amenities : [],
      description: room?.description || "",
    });

    setShowRoomModal(true);
  };

  const handleRoomSubmit = async (event) => {
    event.preventDefault();

    if (!roomForm.roomNumber.trim()) {
      setError("Room number is required.");
      return;
    }

    if (Number(roomForm.price) < 0) {
      setError("Room price cannot be negative.");
      return;
    }

    if (Number(roomForm.capacity) < 1) {
      setError("Room capacity must be at least 1.");
      return;
    }

    if (Number(roomForm.beds) < 1) {
      setError("Room must have at least one bed.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      roomNumber: roomForm.roomNumber.trim(),

      roomType: roomForm.roomType,

      beds: Number(roomForm.beds),

      bedType: roomForm.bedType,

      capacity: Number(roomForm.capacity),

      roomSize: roomForm.roomSize,

      floor: Number(roomForm.floor),

      view: roomForm.view,

      price: Number(roomForm.price),

      status: roomForm.status,

      amenities: roomForm.amenities,

      description: roomForm.description.trim(),
    };

    try {
      if (editingRoom?._id || editingRoom?.id) {
        const roomId = editingRoom._id || editingRoom.id;

        await API.put(`/rooms/${roomId}`, payload);

        setSuccess("Room updated successfully.");
      } else {
        await API.post("/rooms", payload);

        setSuccess("Room added successfully.");
      }

      setShowRoomModal(false);

      resetRoomForm();

      await loadRooms();
    } catch (requestError) {
      console.error("Could not save room:", requestError);

      setError(
        requestError?.response?.data?.message || "Unable to save this room.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE ROOM
  ======================================================= */

  const handleDeleteRoom = async (room) => {
    const roomId = room?._id || room?.id;

    if (!roomId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete room ${
        room.roomNumber || room.number || ""
      }?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await API.delete(`/rooms/${roomId}`);

      setSuccess("Room deleted successfully.");

      await loadRooms();
    } catch (requestError) {
      console.error("Could not delete room:", requestError);

      setError(
        requestError?.response?.data?.message || "Unable to delete this room.",
      );
    }
  };

  /* =======================================================
     AMENITIES
  ======================================================= */

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

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all([loadHotel(), loadBookings(), loadRooms()]);
    } catch (requestError) {
      console.error("Refresh error:", requestError);

      setError("Unable to refresh the dashboard.");
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  /* =======================================================
     OPEN PUBLIC HOTEL
  ======================================================= */

  const openWebsite = () => {
    if (!hotel?._id) return;

    navigate(`/hotels/${hotel._id}`);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="hotel-dashboard-loading">
        <div className="dashboard-loading-card">
          <div className="dashboard-spinner" />

          <h2>Loading your property</h2>

          <p>Preparing your hotel operations dashboard...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR WITHOUT HOTEL
  ======================================================= */

  if (error && !hotel) {
    return (
      <div className="hotel-dashboard-loading">
        <div className="dashboard-loading-card dashboard-error-card">
          <div className="empty-state-icon">
            <Icon name="info" size={25} />
          </div>

          <h2>Property dashboard unavailable</h2>

          <p>{error}</p>

          <button
            type="button"
            className="primary-action-button"
            onClick={loadDashboard}
          >
            <Icon name="refresh" size={15} />
            Try Again
          </button>

          <button
            type="button"
            className="dashboard-back-button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <div className="hotel-admin-dashboard">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="hotel-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span>S</span>
          </div>

          <div>
            <strong>STAYORA</strong>

            <span>PROPERTY MANAGEMENT</span>
          </div>
        </div>

        <div className="sidebar-section-label">Workspace</div>

        <nav className="hotel-sidebar-nav">
          <button
            type="button"
            className="hotel-nav-item active"
            onClick={() =>
              document.querySelector(".hotel-dashboard-main")?.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <Icon name="dashboard" />

            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className="hotel-nav-item"
            onClick={() =>
              document.querySelector(".hotel-property-hero")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <Icon name="hotel" />

            <span>My Property</span>
          </button>

          <button
            type="button"
            className="hotel-nav-item"
            onClick={() =>
              document.querySelector(".hotel-room-management")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <Icon name="rooms" />

            <span>Rooms</span>
          </button>

          <button
            type="button"
            className="hotel-nav-item"
            onClick={() =>
              document.querySelector(".recent-bookings-panel")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            <Icon name="calendar" />

            <span>Reservations</span>
          </button>
        </nav>

        <div className="sidebar-section-label property-label">Property</div>

        <nav className="hotel-sidebar-nav">
          <button
            type="button"
            className="hotel-nav-item"
            onClick={openEditModal}
          >
            <Icon name="edit" />

            <span>Property Details</span>
          </button>

          <button
            type="button"
            className="hotel-nav-item"
            onClick={openWebsite}
          >
            <Icon name="globe" />

            <span>View Website</span>
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

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <Icon name="logout" size={15} />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="hotel-dashboard-main">
        {/* HEADER */}

        <header className="hotel-dashboard-header">
          <div>
            <span className="dashboard-kicker">PROPERTY DASHBOARD</span>

            <h1>
              Good day, <strong>{adminName}</strong>
            </h1>

            <p>Manage your property, rooms and guest stays from one place.</p>
          </div>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label={
                refreshing ? "Refreshing dashboard" : "Refresh dashboard"
              }
              title={
                refreshing ? "Refreshing dashboard..." : "Refresh dashboard"
              }
            >
              <Icon name="refresh" size={15} />
            </button>

            <button
              type="button"
              className="dashboard-website-button"
              onClick={openWebsite}
              disabled={!hotel?._id}
            >
              <Icon name="globe" size={15} />
              View Website
            </button>

            <button
              type="button"
              className="dashboard-notification-button"
              aria-label="Notifications"
            >
              <Icon name="bell" size={17} />

              {todayCheckIns.length > 0 && <span />}
            </button>

            <div className="dashboard-header-avatar">
              {getUserInitials(adminName)}
            </div>
          </div>
        </header>

        {/* ALERTS */}

        {error && (
          <div className="dashboard-alert dashboard-alert-error">
            <div className="alert-icon">
              <Icon name="info" size={15} />
            </div>

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        {success && (
          <div className="dashboard-alert dashboard-alert-success">
            <div className="alert-icon">
              <Icon name="check" size={15} />
            </div>

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Close"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}

        {/* =================================================
            PROPERTY HERO
        ================================================= */}

        {hotel ? (
          <section
            className="hotel-property-hero"
            style={{
              backgroundImage: `url("${getImage(hotel.image)}")`,
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
                  type="button"
                  className="hero-edit-button"
                  onClick={openEditModal}
                >
                  <Icon name="edit" size={14} />
                  Edit Property
                </button>
              </div>

              <div className="property-hero-details">
                <div className="property-rating">
                  <Icon name="star" size={13} />

                  <span>Premium Property</span>

                  <small>Stayora partner</small>
                </div>

                <h2>{hotel.name}</h2>

                <div className="property-location">
                  <Icon name="location" size={14} />

                  <span>{hotel.location || "Location not provided"}</span>
                </div>

                <p>
                  {hotel.description ||
                    "Manage your hotel operations, guest reservations and room inventory from your property dashboard."}
                </p>
              </div>

              <div className="property-quick-stats">
                <div>
                  <strong>{totalRooms}</strong>

                  <span>Total Rooms</span>
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

                  <span>Total Beds</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="dashboard-panel no-property-panel">
            <div className="empty-state">
              <div>
                <Icon name="hotel" size={25} />
              </div>

              <h3>No property assigned</h3>

              <p>
                Your hotel administrator account does not currently have a
                property assigned to it.
              </p>
            </div>
          </section>
        )}

        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="hotel-statistics">
          <article className="hotel-stat-card bookings-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon name="calendar" size={18} />
              </div>

              <span className="stat-period">ALL TIME</span>
            </div>

            <span className="stat-label">Total Reservations</span>

            <strong>{totalBookings}</strong>

            <div className="stat-footer">
              <span>{confirmedBookings.length} confirmed stays</span>

              <Icon name="arrow" size={13} />
            </div>
          </article>

          <article className="hotel-stat-card guests-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon name="users" size={18} />
              </div>

              <span className="stat-period">CURRENT</span>
            </div>

            <span className="stat-label">Active Guest Stays</span>

            <strong>{activeBookings.length}</strong>

            <div className="stat-footer">
              <span className="stat-positive">
                {todayCheckIns.length} arriving today
              </span>

              <Icon name="arrow" size={13} />
            </div>
          </article>

          <article className="hotel-stat-card revenue-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon name="money" size={18} />
              </div>

              <span className="stat-period">BOOKINGS</span>
            </div>

            <span className="stat-label">Property Revenue</span>

            <strong>{formatCurrency(revenue)}</strong>

            <div className="stat-footer">
              <span>{cancelledBookings.length} cancelled</span>

              <Icon name="arrow" size={13} />
            </div>
          </article>

          <article className="hotel-stat-card occupancy-stat">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Icon name="bed" size={18} />
              </div>

              <span className="stat-period">CURRENT</span>
            </div>

            <span className="stat-label">Room Occupancy</span>

            <strong>{occupancyPercentage}%</strong>

            <div className="stat-footer">
              <span>{occupiedRooms + reservedRooms} rooms in use</span>

              <div className="mini-progress">
                <span
                  style={{
                    width: `${occupancyPercentage}%`,
                  }}
                />
              </div>
            </div>
          </article>
        </section>

        {/* =================================================
            ROOM OVERVIEW
        ================================================= */}

        <section className="hotel-room-statistics">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">ROOM INVENTORY</span>

              <h2>Property overview</h2>
            </div>

            <button
              type="button"
              className="section-link"
              onClick={() =>
                document
                  .querySelector(".hotel-room-management")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Manage rooms
              <Icon name="arrow" size={13} />
            </button>
          </div>

          <div className="room-summary-grid">
            <article className="room-summary-card">
              <div className="room-summary-icon">
                <Icon name="bed" size={19} />
              </div>

              <div>
                <span>Total beds</span>

                <strong>{totalBeds}</strong>
              </div>
            </article>

            <article className="room-summary-card">
              <div className="room-summary-icon">
                <Icon name="users" size={19} />
              </div>

              <div>
                <span>Guest capacity</span>

                <strong>{totalCapacity}</strong>
              </div>
            </article>

            <article className="room-summary-card">
              <div className="room-summary-icon">
                <Icon name="check" size={19} />
              </div>

              <div>
                <span>Available beds</span>

                <strong>{availableBeds}</strong>
              </div>
            </article>

            <article className="room-summary-card">
              <div className="room-summary-icon">
                <Icon name="money" size={19} />
              </div>

              <div>
                <span>Average room rate</span>

                <strong>{formatCurrency(averageRoomPrice)}</strong>
              </div>
            </article>
          </div>
        </section>

        {/* =================================================
            OCCUPANCY + TODAY
        ================================================= */}

        <section className="hotel-overview-grid">
          <article className="dashboard-panel occupancy-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">ROOM PERFORMANCE</span>

                <h3>Occupancy overview</h3>
              </div>

              <span className="panel-date">TODAY</span>
            </div>

            <div className="occupancy-content">
              <div
                className="occupancy-circle"
                style={{
                  "--occupancy": `${occupancyPercentage * 3.6}deg`,
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
          </article>

          <article className="dashboard-panel today-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">GUEST ACTIVITY</span>

                <h3>Today at your property</h3>
              </div>

              <div className="today-calendar">
                <Icon name="calendar" size={16} />
              </div>
            </div>

            <div className="today-overview-list">
              <div className="today-overview-item">
                <div className="today-item-icon check-in">
                  <Icon name="arrow" size={14} />
                </div>

                <div>
                  <strong>{todayCheckIns.length}</strong>

                  <span>Check-ins</span>
                </div>

                <small>Arrivals</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon check-out">
                  <Icon name="arrow" size={14} />
                </div>

                <div>
                  <strong>{todayCheckOuts.length}</strong>

                  <span>Check-outs</span>
                </div>

                <small>Departures</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon confirmed">
                  <Icon name="check" size={14} />
                </div>

                <div>
                  <strong>{confirmedBookings.length}</strong>

                  <span>Confirmed</span>
                </div>

                <small>Reservations</small>
              </div>

              <div className="today-overview-item">
                <div className="today-item-icon cancelled">
                  <Icon name="close" size={14} />
                </div>

                <div>
                  <strong>{cancelledBookings.length}</strong>

                  <span>Cancelled</span>
                </div>

                <small>Reservations</small>
              </div>
            </div>
          </article>
        </section>

        {/* =================================================
            ROOM MANAGEMENT
        ================================================= */}

        <section className="dashboard-panel hotel-room-management">
          <div className="room-management-header">
            <div>
              <span className="panel-eyebrow">YOUR PROPERTY</span>

              <h2>Room management</h2>

              <p>Add, update and monitor the rooms available at your hotel.</p>
            </div>

            <button
              type="button"
              className="primary-action-button"
              onClick={openAddRoomModal}
            >
              <Icon name="plus" size={15} />
              Add Room
            </button>
          </div>

          {rooms.length > 0 ? (
            <div className="hotel-room-table-wrapper">
              <table className="hotel-room-table">
                <thead>
                  <tr>
                    <th>Room</th>

                    <th>Type</th>

                    <th>Beds</th>

                    <th>Capacity</th>

                    <th>Price</th>

                    <th>Status</th>

                    <th>Details</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room) => {
                    const roomStatus = String(
                      room.status || "available",
                    ).toLowerCase();

                    return (
                      <tr key={room._id || room.id}>
                        <td>
                          <div className="room-number-cell">
                            <div className="room-number-icon">
                              <Icon name="bed" size={15} />
                            </div>

                            <div>
                              <strong>
                                Room {room.roomNumber || room.number || "—"}
                              </strong>

                              <span>Floor {room.floor ?? "—"}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="room-type">
                            {room.roomType || "Standard"}
                          </span>
                        </td>

                        <td>
                          <span className="table-value">{room.beds || 0}</span>
                        </td>

                        <td>
                          <span className="table-value">
                            {room.capacity || 0}

                            <small> guests</small>
                          </span>
                        </td>

                        <td>
                          <span className="room-price">
                            {formatCurrency(room.price)}
                          </span>

                          <span className="price-night">/night</span>
                        </td>

                        <td>
                          <span className={`room-status ${roomStatus}`}>
                            <i />

                            {roomStatus}
                          </span>
                        </td>

                        <td>
                          <div className="room-details-cell">
                            <span>{room.bedType || "Bed type not set"}</span>

                            <span>{room.view || "View not set"}</span>
                          </div>
                        </td>

                        <td>
                          <div className="room-actions">
                            <button
                              type="button"
                              className="room-action edit"
                              onClick={() => openEditRoomModal(room)}
                              title="Edit room"
                            >
                              <Icon name="edit" size={13} />
                            </button>

                            <button
                              type="button"
                              className="room-action delete"
                              onClick={() => handleDeleteRoom(room)}
                              title="Delete room"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="room-empty-state">
              <div className="empty-state-icon">
                <Icon name="bed" size={25} />
              </div>

              <h3>No rooms added yet</h3>

              <p>
                Add your first room to start managing availability, capacity and
                room pricing.
              </p>

              <button
                type="button"
                className="primary-action-button"
                onClick={openAddRoomModal}
              >
                <Icon name="plus" size={14} />
                Add First Room
              </button>
            </div>
          )}
        </section>

        {/* =================================================
            BOOKINGS
        ================================================= */}

        <section className="hotel-dashboard-grid">
          <article className="dashboard-panel recent-bookings-panel">
            <div className="panel-header">
              <div>
                <span className="panel-eyebrow">GUEST RESERVATIONS</span>

                <h3>Recent bookings</h3>
              </div>

              <span className="booking-count">{totalBookings} TOTAL</span>
            </div>

            {recentBookings.length > 0 ? (
              <div className="recent-bookings-list">
                {recentBookings.map((booking) => {
                  const status = getBookingStatus(booking);

                  const guestName = getGuestName(booking);

                  const guestEmail = getGuestEmail(booking);

                  const checkIn =
                    booking?.checkIn ||
                    booking?.checkInDate ||
                    booking?.startDate;

                  const checkOut =
                    booking?.checkOut ||
                    booking?.checkOutDate ||
                    booking?.endDate;

                  const amount =
                    booking?.totalPrice ??
                    booking?.totalAmount ??
                    booking?.amount ??
                    booking?.price ??
                    0;

                  return (
                    <div
                      className="recent-booking-item"
                      key={booking._id || booking.id}
                    >
                      <div className="guest-avatar sidebar-avatar">
                        {getUserInitials(guestName)}
                      </div>

                      <div className="guest-info">
                        <strong>{guestName}</strong>

                        <span>{guestEmail}</span>
                      </div>

                      <div className="booking-dates">
                        <span>
                          {formatDate(checkIn)} → {formatDate(checkOut)}
                        </span>

                        <small>Guest stay</small>
                      </div>

                      <div className="booking-price">
                        {formatCurrency(amount)}
                      </div>

                      <span className={`booking-status ${status}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="booking-empty">
                <div className="empty-state-icon small">
                  <Icon name="calendar" size={21} />
                </div>

                <h4>No reservations yet</h4>

                <p>
                  New guest reservations for your property will appear here.
                </p>
              </div>
            )}
          </article>

          <div className="dashboard-right-column">
            <article className="dashboard-panel property-summary-card">
              <div className="property-summary-image">
                <img
                  src={getImage(hotel?.image)}
                  alt={hotel?.name || "Hotel"}
                />

                <span>
                  <Icon name="star" size={10} />
                  Live property
                </span>
              </div>

              <div className="property-summary-content">
                <span className="panel-eyebrow">MY PROPERTY</span>

                <h3>{hotel?.name || "Your Hotel"}</h3>

                <p>
                  <Icon name="location" size={11} />

                  {hotel?.location || "Location not available"}
                </p>

                <button
                  type="button"
                  className="outline-action-button"
                  onClick={openWebsite}
                >
                  <Icon name="eye" size={13} />
                  Open Public Listing
                </button>
              </div>
            </article>

            <article className="dashboard-panel quick-actions-card">
              <div className="panel-header">
                <div>
                  <span className="panel-eyebrow">SHORTCUTS</span>

                  <h3>Property actions</h3>
                </div>
              </div>

              <div className="quick-actions-grid">
                <button type="button" onClick={openAddRoomModal}>
                  <div>
                    <Icon name="plus" size={14} />
                  </div>
                  Add a room
                </button>

                <button type="button" onClick={openEditModal}>
                  <div>
                    <Icon name="edit" size={14} />
                  </div>
                  Edit property
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .querySelector(".recent-bookings-panel")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                >
                  <div>
                    <Icon name="calendar" size={14} />
                  </div>
                  View reservations
                </button>

                <button type="button" onClick={openWebsite}>
                  <div>
                    <Icon name="globe" size={14} />
                  </div>
                  View website
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="hotel-dashboard-footer">
          <span>STAYORA</span>

          <span>•</span>

          <span>Property Management</span>

          <span>•</span>

          <span>{hotel?.name || "Your Property"}</span>
        </footer>
      </main>

      {/* =================================================
          EDIT PROPERTY MODAL
      ================================================= */}

      {showEditModal && (
        <div
          className="hotel-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="hotel-edit-modal">
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">MY PROPERTY</span>

                <h2>Edit property</h2>

                <p>Update the information guests see for your hotel.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
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
                    placeholder="Hotel name"
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
                    placeholder="Hotel location"
                  />
                </label>

                <label>
                  <span>Total rooms</span>

                  <input
                    type="number"
                    min="1"
                    value={formData.rooms}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        rooms: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  <span>Starting room price</span>

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
                    />
                  </div>
                </label>
              </div>

              <label className="full-width-field">
                <span>Property image URL</span>

                <input
                  type="text"
                  value={formData.image}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      image: event.target.value,
                    })
                  }
                  placeholder="https://..."
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
                  placeholder="Describe your property..."
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
                  {saving ? "Saving..." : "Save Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================
          ROOM MODAL
      ================================================= */}

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

                <h2>{editingRoom ? "Edit room" : "Add room"}</h2>

                <p>Configure the room details, pricing and guest amenities.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowRoomModal(false);

                  resetRoomForm();
                }}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit}>
              {/* BASIC INFORMATION */}

              <section className="room-form-section">
                <div className="room-form-section-title">
                  <span>01</span>

                  <div>
                    <strong>Basic information</strong>

                    <small>Identify the room and its type.</small>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <label>
                    <span>Room number</span>

                    <input
                      type="text"
                      value={roomForm.roomNumber}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          roomNumber: event.target.value,
                        })
                      }
                      placeholder="e.g. 101"
                    />
                  </label>

                  <label>
                    <span>Room type</span>

                    <select
                      value={roomForm.roomType}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          roomType: event.target.value,
                        })
                      }
                    >
                      <option>Standard</option>

                      <option>Deluxe</option>

                      <option>Superior</option>

                      <option>Executive</option>

                      <option>Suite</option>

                      <option>Family</option>

                      <option>Presidential</option>
                    </select>
                  </label>

                  <label>
                    <span>Floor</span>

                    <input
                      type="number"
                      min="0"
                      value={roomForm.floor}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          floor: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Room size</span>

                    <input
                      type="text"
                      value={roomForm.roomSize}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          roomSize: event.target.value,
                        })
                      }
                      placeholder="e.g. 32 m²"
                    />
                  </label>
                </div>
              </section>

              {/* BED & CAPACITY */}

              <section className="room-form-section">
                <div className="room-form-section-title">
                  <span>02</span>

                  <div>
                    <strong>Sleeping arrangement</strong>

                    <small>Define beds and guest capacity.</small>
                  </div>
                </div>

                <div className="modal-form-grid">
                  <label>
                    <span>Number of beds</span>

                    <input
                      type="number"
                      min="1"
                      value={roomForm.beds}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          beds: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>Bed type</span>

                    <select
                      value={roomForm.bedType}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          bedType: event.target.value,
                        })
                      }
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
                      value={roomForm.capacity}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          capacity: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span>View</span>

                    <select
                      value={roomForm.view}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          view: event.target.value,
                        })
                      }
                    >
                      <option>City View</option>

                      <option>Garden View</option>

                      <option>Pool View</option>

                      <option>Mountain View</option>

                      <option>Ocean View</option>

                      <option>Courtyard View</option>
                    </select>
                  </label>
                </div>
              </section>

              {/* PRICE & STATUS */}

              <section className="room-form-section">
                <div className="room-form-section-title">
                  <span>03</span>

                  <div>
                    <strong>Price & availability</strong>

                    <small>Set the room rate and current status.</small>
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
                        value={roomForm.price}
                        onChange={(event) =>
                          setRoomForm({
                            ...roomForm,
                            price: event.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </label>

                  <label>
                    <span>Status</span>

                    <select
                      value={roomForm.status}
                      onChange={(event) =>
                        setRoomForm({
                          ...roomForm,
                          status: event.target.value,
                        })
                      }
                    >
                      <option value="available">Available</option>

                      <option value="occupied">Occupied</option>

                      <option value="reserved">Reserved</option>

                      <option value="maintenance">Maintenance</option>
                    </select>
                  </label>
                </div>
              </section>

              {/* AMENITIES */}

              <section className="room-form-section">
                <div className="room-form-section-title">
                  <span>04</span>

                  <div>
                    <strong>Room amenities</strong>

                    <small>Select everything included in this room.</small>
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
                          {selected && <Icon name="check" size={11} />}
                        </span>

                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* DESCRIPTION */}

              <section className="room-form-section">
                <div className="room-form-section-title">
                  <span>05</span>

                  <div>
                    <strong>Room description</strong>

                    <small>Add useful information for your property.</small>
                  </div>
                </div>

                <label className="full-width-field">
                  <span>Description</span>

                  <textarea
                    rows="4"
                    value={roomForm.description}
                    onChange={(event) =>
                      setRoomForm({
                        ...roomForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe this room..."
                  />
                </label>
              </section>

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
                      : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelAdminDashboard;
