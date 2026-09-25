import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./HotelAdmins.css";

/* =========================================================
   ICONS
   ========================================================= */

const Icon = ({ name, size = 20 }) => {
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
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    hotel: (
      <svg {...common}>
        <path d="M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v16" />
        <path d="M7 7h2" />
        <path d="M15 7h2" />
        <path d="M7 11h2" />
        <path d="M15 11h2" />
        <path d="M7 15h2" />
        <path d="M15 15h2" />
        <path d="M10 21v-3h4v3" />
      </svg>
    ),

    booking: (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
      </svg>
    ),

    users: (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    report: (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 5h14l-2 4 2 4H4" />
      </svg>
    ),

    plus: (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),

    external: (
      <svg {...common}>
        <path d="M14 3h7v7" />
        <path d="M10 14L21 3" />
        <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
      </svg>
    ),

    logout: (
      <svg {...common}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </svg>
    ),

    search: (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    ),

    refresh: (
      <svg {...common}>
        <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
      </svg>
    ),

    edit: (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    ),

    trash: (
      <svg {...common}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
    ),

    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    close: (
      <svg {...common}>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    ),

    location: (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),

    building: (
      <svg {...common}>
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M8 7h2" />
        <path d="M14 7h2" />
        <path d="M8 11h2" />
        <path d="M14 11h2" />
        <path d="M8 15h2" />
        <path d="M14 15h2" />
      </svg>
    ),

    bell: (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),
  };

  return icons[name] || null;
};

/* =========================================================
   HELPERS
   ========================================================= */

const getInitials = (name = "Admin") => {
  const cleanName = String(name).trim();

  if (!cleanName) {
    return "SA";
  }

  const words = cleanName.split(/\s+/);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return cleanName.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    "avatar-blue",
    "avatar-purple",
    "avatar-green",
    "avatar-orange",
    "avatar-pink",
    "avatar-cyan",
  ];

  let total = 0;

  for (let i = 0; i < String(name).length; i++) {
    total += String(name).charCodeAt(i);
  }

  return colors[total % colors.length];
};

/* =========================================================
   COMPONENT
   ========================================================= */

const HotelAdmins = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hotelFilter, setHotelFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hotelId: "",
    isActive: true,
  });

  /* =========================================================
     CURRENT USER
     ========================================================= */

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
    } catch (err) {
      console.error("USER PARSE ERROR:", err);
    }
  }, []);

  /* =========================================================
     FETCH HOTEL ADMINS
     IMPORTANT:
     This uses /users/hotel-admins
     NOT /users
     ========================================================= */

  const fetchAdmins = async () => {
    try {
      console.log("Fetching hotel administrators...");

      const response = await API.get("/users/hotel-admins");

      console.log("HOTEL ADMINS RESPONSE:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.admins || [];

      setAdmins(data);
    } catch (err) {
      console.error("FETCH ADMINS ERROR:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to manage hotel administrators. Please sign in with the Super Admin account.",
        );
      } else if (err.response?.status === 404) {
        setError(
          "Hotel administrator API route was not found. Please check the backend user routes.",
        );
      } else {
        setError(
          err.response?.data?.message || "Unable to load hotel administrators.",
        );
      }

      setAdmins([]);
    }
  };

  /* =========================================================
     FETCH HOTELS
     ========================================================= */

  const fetchHotels = async () => {
    try {
      console.log("Fetching hotels...");

      const response = await API.get("/hotels");

      console.log("HOTELS RESPONSE:", response.data);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.hotels || [];

      setHotels(data);
    } catch (err) {
      console.error("FETCH HOTELS ERROR:", err);

      /*
       * Do not replace the hotel-admin error with a hotel error.
       */
    }
  };

  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchAdmins(), fetchHotels()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     HOTEL HELPERS
     ========================================================= */

  const getHotelObject = (admin) => {
    if (admin?.hotel && typeof admin.hotel === "object") {
      return admin.hotel;
    }

    if (admin?.assignedHotel && typeof admin.assignedHotel === "object") {
      return admin.assignedHotel;
    }

    if (admin?.hotelId && typeof admin.hotelId === "object") {
      return admin.hotelId;
    }

    const adminId = String(admin?._id || admin?.id || "");

    return hotels.find((hotel) => {
      const hotelAdmin =
        hotel?.hotelAdmin?._id || hotel?.hotelAdmin?.id || hotel?.hotelAdmin;

      return String(hotelAdmin || "") === adminId;
    });
  };

  const getHotelName = (admin) => {
    const hotel = getHotelObject(admin);

    return hotel?.name || "Not assigned";
  };

  const getHotelLocation = (admin) => {
    const hotel = getHotelObject(admin);

    return hotel?.location || "Not assigned";
  };

  const isAssigned = (admin) => {
    return Boolean(getHotelObject(admin));
  };

  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalAdmins = admins.length;

  const activeAdmins = admins.filter(
    (admin) => admin.isActive !== false,
  ).length;

  const inactiveAdmins = admins.filter(
    (admin) => admin.isActive === false,
  ).length;

  const assignedAdmins = admins.filter(isAssigned).length;

  const unassignedAdmins = totalAdmins - assignedAdmins;

  /* =========================================================
     FILTERING
     ========================================================= */

  const filteredAdmins = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return admins.filter((admin) => {
      const name = String(admin.name || "").toLowerCase();

      const email = String(admin.email || "").toLowerCase();

      const hotelName = getHotelName(admin).toLowerCase();

      const location = getHotelLocation(admin).toLowerCase();

      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        email.includes(searchText) ||
        hotelName.includes(searchText) ||
        location.includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && admin.isActive !== false) ||
        (statusFilter === "inactive" && admin.isActive === false);

      const hotel = getHotelObject(admin);

      const matchesHotel =
        hotelFilter === "all" ||
        String(hotel?._id || hotel?.id || "") === hotelFilter;

      return matchesSearch && matchesStatus && matchesHotel;
    });
  }, [admins, search, statusFilter, hotelFilter, hotels]);

  /* =========================================================
     CREATE MODAL
     ========================================================= */

  const openCreateModal = () => {
    setEditingAdmin(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      hotelId: "",
      isActive: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT MODAL
     ========================================================= */

  const openEditModal = (admin) => {
    const hotel = getHotelObject(admin);

    setEditingAdmin(admin);

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      hotelId: hotel?._id || hotel?.id || "",
      isActive: admin.isActive !== false,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingAdmin(null);
  };

  /* =========================================================
     FORM CHANGE
     ========================================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
     SAVE ADMIN
     ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter the administrator name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the administrator email.");
      return;
    }

    if (!editingAdmin && !formData.password.trim()) {
      setError("Please enter a password.");
      return;
    }

    try {
      setSaving(true);

      if (editingAdmin) {
        const adminId = editingAdmin._id || editingAdmin.id;

        await API.put(`/users/hotel-admins/${adminId}`, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          hotelId: formData.hotelId || null,
        });

        setSuccess("Hotel administrator updated successfully.");
      } else {
        await API.post("/users/create-hotel-admin", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          hotelId: formData.hotelId || null,
        });

        setSuccess("Hotel administrator created successfully.");
      }

      await loadData();

      setTimeout(() => {
        setShowModal(false);
        setEditingAdmin(null);
        setSuccess("");
      }, 800);
    } catch (err) {
      console.error("SAVE ADMIN ERROR:", err);

      if (err.response?.status === 403) {
        setError(
          "You must be logged in as the Super Admin to perform this action.",
        );
      } else {
        setError(
          err.response?.data?.message || "Unable to save hotel administrator.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE ADMIN
     ========================================================= */

  const handleDelete = async (admin) => {
    const adminId = admin._id || admin.id;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name || "this administrator"}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await API.delete(`/users/hotel-admins/${adminId}`);

      setSuccess("Hotel administrator deleted successfully.");

      await fetchAdmins();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("DELETE ADMIN ERROR:", err);

      if (err.response?.status === 403) {
        setError(
          "You must be logged in as the Super Admin to delete administrators.",
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to delete hotel administrator.",
        );
      }
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
      <div className="hotel-admin-page">
        <aside className="ha-sidebar">
          <div className="ha-brand">
            <div className="ha-brand-icon">
              <Icon name="hotel" size={24} />
            </div>

            <div>
              <div className="ha-brand-name">StayHub</div>

              <div className="ha-brand-subtitle">HOTEL MANAGEMENT</div>
            </div>
          </div>

          <div className="ha-loading-sidebar">
            <div className="ha-skeleton-line" />
            <div className="ha-skeleton-line" />
            <div className="ha-skeleton-line" />
            <div className="ha-skeleton-line" />
          </div>
        </aside>

        <main className="ha-main">
          <div className="ha-loading">
            <div className="ha-spinner" />

            <h3>Loading administrators...</h3>

            <p>Please wait while we load your hotel admin data.</p>
          </div>
        </main>
      </div>
    );
  }

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="hotel-admin-page">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="ha-sidebar">
        <div className="ha-brand">
          <div className="ha-brand-icon">
            <Icon name="hotel" size={24} />
          </div>

          <div>
            <div className="ha-brand-name">StayHub</div>

            <div className="ha-brand-subtitle">HOTEL MANAGEMENT</div>
          </div>
        </div>

        <div className="ha-sidebar-title">Super Admin System</div>

        <nav className="ha-nav">
          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/dashboard")}
          >
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/hotels")}
          >
            <Icon name="hotel" />
            <span>Hotels</span>
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            <Icon name="booking" />
            <span>Bookings</span>
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            <Icon name="users" />
            <span>Users</span>
          </button>
        </nav>

        <div className="ha-sidebar-divider" />

        <div className="ha-section-label">MANAGEMENT</div>

        <nav className="ha-nav">
          <button className="ha-nav-item active">
            <Icon name="users" />
            <span>Hotel Admins</span>
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/reports")}
          >
            <Icon name="report" />
            <span>Reports</span>
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/add-hotel")}
          >
            <Icon name="plus" />
            <span>Add Hotel</span>
          </button>

          <button className="ha-nav-item" onClick={() => navigate("/")}>
            <Icon name="external" />
            <span>View Website</span>
          </button>
        </nav>

        <div className="ha-sidebar-bottom">
          <div className="ha-sidebar-user">
            <div className="ha-sidebar-avatar">
              {getInitials(currentUser?.name || "SA")}
            </div>

            <div className="ha-sidebar-user-info">
              <strong>{currentUser?.name || "Super Admin"}</strong>

              <span>Super Administrator</span>
            </div>
          </div>

          <button className="ha-logout" onClick={handleLogout}>
            <Icon name="logout" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="ha-main">
        {/* TOP BAR */}

        <header className="ha-topbar">
          <div className="ha-global-search">
            <Icon name="search" size={19} />

            <span>Search hotels, admins, or anything...</span>
          </div>

          <div className="ha-topbar-right">
            <button className="ha-notification">
              <Icon name="bell" size={20} />
              <span />
            </button>

            <div className="ha-user-menu">
              <div className="ha-top-avatar">
                {getInitials(currentUser?.name || "SA")}
              </div>

              <div className="ha-top-user-info">
                <strong>{currentUser?.name || "Super Admin"}</strong>

                <span>Super Admin</span>
              </div>

              <span className="ha-chevron">⌄</span>
            </div>
          </div>
        </header>

        <div className="ha-content">
          {/* BREADCRUMB */}

          <div className="ha-breadcrumb">
            <span>Administration</span>

            <span>›</span>

            <strong>Hotel Administrators</strong>
          </div>

          {/* PAGE HEADER */}

          <section className="ha-page-header">
            <div className="ha-page-header-left">
              <div className="ha-page-icon">
                <Icon name="users" size={30} />
              </div>

              <div>
                <div className="ha-kicker">TEAM MANAGEMENT</div>

                <h1>Hotel Administrators</h1>

                <p>
                  Create, assign and manage administrators responsible for
                  individual hotels.
                </p>
              </div>
            </div>

            <button className="ha-primary-button" onClick={openCreateModal}>
              <Icon name="plus" size={19} />
              Add Hotel Admin
            </button>
          </section>

          {/* ALERTS */}

          {error && (
            <div className="ha-alert ha-alert-error">
              <span>!</span>

              <p>{error}</p>

              <button onClick={() => setError("")}>
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="ha-alert ha-alert-success">
              <span>
                <Icon name="check" size={16} />
              </span>

              <p>{success}</p>

              <button onClick={() => setSuccess("")}>
                <Icon name="close" size={16} />
              </button>
            </div>
          )}

          {/* =================================================
              STATISTICS
              ================================================= */}

          <section className="ha-stats-grid">
            <div className="ha-stat-card blue">
              <div className="ha-stat-icon">
                <Icon name="users" size={24} />
              </div>

              <div className="ha-stat-content">
                <span>Total Administrators</span>

                <strong>{totalAdmins}</strong>

                <small>Hotel management team</small>
              </div>
            </div>

            <div className="ha-stat-card green">
              <div className="ha-stat-icon">
                <Icon name="check" size={25} />
              </div>

              <div className="ha-stat-content">
                <span>Assigned to Hotels</span>

                <strong>{assignedAdmins}</strong>

                <small>Administrators with hotel access</small>
              </div>
            </div>

            <div className="ha-stat-card orange">
              <div className="ha-stat-icon">
                <Icon name="clock" size={24} />
              </div>

              <div className="ha-stat-content">
                <span>Unassigned</span>

                <strong>{unassignedAdmins}</strong>

                <small>Need hotel assignment</small>
              </div>
            </div>

            <div className="ha-stat-card purple">
              <div className="ha-stat-icon">
                <Icon name="building" size={24} />
              </div>

              <div className="ha-stat-content">
                <span>Available Hotels</span>

                <strong>{hotels.length}</strong>

                <small>Properties in the system</small>
              </div>
            </div>
          </section>

          {/* =================================================
              DIRECTORY
              ================================================= */}

          <section className="ha-directory">
            <div className="ha-directory-header">
              <div>
                <div className="ha-directory-kicker">
                  ADMINISTRATOR DIRECTORY
                </div>

                <h2>Hotel Admin Accounts</h2>

                <p>Manage access and hotel assignments from one place.</p>
              </div>

              <div className="ha-directory-count">
                {filteredAdmins.length} of {admins.length}
              </div>
            </div>

            {/* FILTER BAR */}

            <div className="ha-filter-bar">
              <div className="ha-search-box">
                <Icon name="search" size={19} />

                <input
                  type="text"
                  placeholder="Search by name, email or hotel..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="ha-filter-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>
              </select>

              <select
                className="ha-filter-select"
                value={hotelFilter}
                onChange={(event) => setHotelFilter(event.target.value)}
              >
                <option value="all">All Hotels</option>

                {hotels.map((hotel) => (
                  <option
                    key={hotel._id || hotel.id}
                    value={hotel._id || hotel.id}
                  >
                    {hotel.name}
                  </option>
                ))}
              </select>

              <button
                className="ha-clear-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setHotelFilter("all");
                }}
              >
                <Icon name="refresh" size={17} />
                Clear Filters
              </button>
            </div>

            {/* TABLE */}

            <div className="ha-table-wrapper">
              <table className="ha-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <input type="checkbox" />
                    </th>

                    <th>ADMINISTRATOR</th>

                    <th>EMAIL</th>

                    <th>ASSIGNED HOTEL</th>

                    <th>LOCATION</th>

                    <th>ROLE</th>

                    <th>STATUS</th>

                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="8">
                        <div className="ha-empty">
                          <div className="ha-empty-icon">
                            <Icon name="users" size={30} />
                          </div>

                          <h3>No administrators found</h3>

                          <p>
                            Try changing your search or filters, or create a new
                            hotel administrator.
                          </p>

                          <button
                            className="ha-primary-button small"
                            onClick={openCreateModal}
                          >
                            <Icon name="plus" size={17} />
                            Add Hotel Admin
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const adminId = admin._id || admin.id;

                      const hotel = getHotelObject(admin);

                      const assigned = Boolean(hotel);

                      const active = admin.isActive !== false;

                      return (
                        <tr key={adminId}>
                          <td className="checkbox-column">
                            <input type="checkbox" />
                          </td>

                          {/* ADMIN */}

                          <td>
                            <div className="ha-admin-cell">
                              <div
                                className={`ha-avatar ${getAvatarColor(
                                  admin.name,
                                )}`}
                              >
                                {getInitials(admin.name)}
                              </div>

                              <div className="ha-admin-info">
                                <strong>{admin.name || "Unnamed Admin"}</strong>

                                <span>ID: {String(adminId).slice(-6)}</span>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}

                          <td>
                            <span className="ha-email">
                              {admin.email || "—"}
                            </span>
                          </td>

                          {/* HOTEL */}

                          <td>
                            <div className="ha-hotel-cell">
                              <div className="ha-hotel-icon">
                                <Icon name="building" size={17} />
                              </div>

                              <span>{getHotelName(admin)}</span>
                            </div>
                          </td>

                          {/* LOCATION */}

                          <td>
                            <div className="ha-location-cell">
                              {assigned ? (
                                <>
                                  <Icon name="location" size={16} />

                                  <span>{getHotelLocation(admin)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="ha-dash">—</span>

                                  <span className="not-assigned">
                                    Not assigned
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* ROLE */}

                          <td>
                            <span className="ha-role-badge">Hotel Admin</span>
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={`ha-status ${
                                active ? "active" : "inactive"
                              }`}
                            >
                              <span className="status-dot" />

                              {active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td>
                            <div className="ha-actions">
                              <button
                                className="ha-action edit"
                                title="Edit administrator"
                                onClick={() => openEditModal(admin)}
                              >
                                <Icon name="edit" size={17} />
                              </button>

                              <button
                                className="ha-action delete"
                                title="Delete administrator"
                                onClick={() => handleDelete(admin)}
                              >
                                <Icon name="trash" size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TABLE FOOTER */}

            <div className="ha-table-footer">
              <span>
                Showing <strong>{filteredAdmins.length}</strong> of{" "}
                <strong>{admins.length}</strong> administrators
              </span>

              <div className="ha-pagination">
                <button disabled>‹</button>

                <button className="current">1</button>

                <button disabled>›</button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          MODAL
          ===================================================== */}

      {showModal && (
        <div
          className="ha-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="ha-modal">
            <div className="ha-modal-header">
              <div>
                <div className="ha-modal-kicker">TEAM MANAGEMENT</div>

                <h2>
                  {editingAdmin
                    ? "Edit Hotel Administrator"
                    : "Add Hotel Administrator"}
                </h2>

                <p>
                  {editingAdmin
                    ? "Update administrator details and hotel assignment."
                    : "Create a new administrator account and assign a hotel."}
                </p>
              </div>

              <button className="ha-modal-close" onClick={closeModal}>
                <Icon name="close" size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ha-form-grid">
                <div className="ha-field full">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter administrator name"
                  />
                </div>

                <div className="ha-field">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                  />
                </div>

                {!editingAdmin && (
                  <div className="ha-field">
                    <label>Password</label>

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create password"
                    />
                  </div>
                )}

                <div className="ha-field full">
                  <label>Assign Hotel</label>

                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleChange}
                  >
                    <option value="">No hotel assigned</option>

                    {hotels.map((hotel) => (
                      <option
                        key={hotel._id || hotel.id}
                        value={hotel._id || hotel.id}
                      >
                        {hotel.name}
                        {hotel.location ? ` — ${hotel.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {editingAdmin && (
                  <div className="ha-active-toggle full">
                    <div>
                      <strong>Account Status</strong>

                      <span>
                        Allow this administrator to access their hotel
                        dashboard.
                      </span>
                    </div>

                    <label className="ha-switch">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />

                      <span />
                    </label>
                  </div>
                )}
              </div>

              <div className="ha-modal-footer">
                <button
                  type="button"
                  className="ha-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ha-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="ha-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={18} />

                      {editingAdmin ? "Save Changes" : "Create Administrator"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelAdmins;
