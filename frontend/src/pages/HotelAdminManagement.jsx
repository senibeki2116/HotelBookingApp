import React, { useEffect, useMemo, useState } from "react";
import "./HotelAdminManagement.css";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function HotelAdminManagement() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hotelId: "",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [adminsResponse, hotelsResponse] = await Promise.all([
        API.get("/users/hotel-admins"),
        API.get("/hotels"),
      ]);

      const adminData = Array.isArray(adminsResponse.data)
        ? adminsResponse.data
        : adminsResponse.data?.hotelAdmins || [];

      const hotelData = Array.isArray(hotelsResponse.data)
        ? hotelsResponse.data
        : hotelsResponse.data?.hotels || [];

      const normalizedAdmins = adminData.map((admin) => ({
        ...admin,
        _id: admin._id || admin.id,
        hotel: admin.hotel
          ? {
              ...admin.hotel,
              _id: admin.hotel._id || admin.hotel.id,
            }
          : null,
        hotelId:
          admin.hotelId ||
          admin.hotel?._id ||
          admin.hotel?.id ||
          admin.assignedHotel?._id ||
          admin.assignedHotel?.id ||
          "",
      }));

      const normalizedHotels = hotelData.map((hotel) => ({
        ...hotel,
        _id: hotel._id || hotel.id,
      }));

      setAdmins(normalizedAdmins);
      setHotels(normalizedHotels);
    } catch (err) {
      console.error("Hotel admin loading error:", err);

      setError(
        err.response?.data?.message || "Unable to load hotel administrators.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredAdmins = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return admins;
    }

    return admins.filter((admin) => {
      const name = String(admin.name || "").toLowerCase();
      const email = String(admin.email || "").toLowerCase();

      const hotelName = String(
        admin.hotel?.name || admin.hotelName || "",
      ).toLowerCase();

      const hotelLocation = String(admin.hotel?.location || "").toLowerCase();

      return (
        name.includes(value) ||
        email.includes(value) ||
        hotelName.includes(value) ||
        hotelLocation.includes(value)
      );
    });
  }, [admins, search]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalAdmins = admins.length;

  const assignedAdmins = admins.filter(
    (admin) => admin.hotel || admin.hotelId || admin.assignedHotel,
  ).length;

  const unassignedAdmins = totalAdmins - assignedAdmins;

  /* =========================================================
     FORM
  ========================================================= */

  const openAddModal = () => {
    setEditingAdmin(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      hotelId: "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      hotelId:
        admin.hotel?._id ||
        admin.hotel?.id ||
        admin.hotelId ||
        admin.assignedHotel?._id ||
        admin.assignedHotel?.id ||
        "",
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAdmin(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     CREATE / UPDATE
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

    if (!formData.hotelId) {
      setError("Please select a hotel.");
      return;
    }

    try {
      setSaving(true);

      const adminId = editingAdmin?._id || editingAdmin?.id;

      if (editingAdmin) {
        await API.put(`/users/hotel-admins/${adminId}`, {
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          hotelId: formData.hotelId,
        });

        setSuccess("Hotel administrator updated successfully.");
      } else {
        await API.post("/users/create-hotel-admin", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          hotelId: formData.hotelId,
        });

        setSuccess("Hotel administrator created successfully.");
      }

      await loadData();

      setTimeout(() => {
        setShowModal(false);
        setEditingAdmin(null);
        setSuccess("");
      }, 900);
    } catch (err) {
      console.error("Save hotel admin error:", err);

      setError(
        err.response?.data?.message || "Unable to save hotel administrator.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (admin) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await API.delete(`/users/hotel-admins/${admin._id || admin.id}`);

      setSuccess("Hotel administrator deleted successfully.");

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error("Delete hotel admin error:", err);

      setError(
        err.response?.data?.message || "Unable to delete hotel administrator.",
      );
    }
  };

  /* =========================================================
     HOTEL NAME
  ========================================================= */

  const getHotel = (admin) => {
    if (admin.hotel) {
      return admin.hotel;
    }

    if (admin.assignedHotel) {
      return admin.assignedHotel;
    }

    const hotelId = admin.hotelId;

    if (!hotelId) {
      return null;
    }

    return hotels.find(
      (hotel) => String(hotel._id || hotel.id) === String(hotelId),
    );
  };

  /* =========================================================
     INITIAL
  ========================================================= */

  const getInitial = (name) => {
    return String(name || "A")
      .charAt(0)
      .toUpperCase();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="hotel-admin-page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="hotel-admin-sidebar">
        <div className="ha-brand">
          <div className="ha-brand-icon">◆</div>

          <div>
            <h2>
              Stay<span>Hub</span>
            </h2>

            <small>HOTEL MANAGEMENT</small>
          </div>
        </div>

        <div className="ha-sidebar-profile">
          <div className="ha-profile-avatar">A</div>

          <div>
            <strong>Super Admin</strong>
            <span>System Administrator</span>
          </div>
        </div>

        <nav className="ha-navigation">
          <div className="ha-nav-label">MAIN MENU</div>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/manage-hotels")}
          >
            <span>▣</span>
            Hotels
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            <span>▤</span>
            Bookings
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            <span>◉</span>
            Users
          </button>

          <div className="ha-nav-label">MANAGEMENT</div>

          <button className="ha-nav-item active">
            <span>♙</span>
            Hotel Admins
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/reports")}
          >
            <span>◫</span>
            Reports
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/add-hotel")}
          >
            <span>＋</span>
            Add Hotel
          </button>
        </nav>

        <div className="ha-sidebar-bottom">
          <button onClick={() => navigate("/")}>↗ View Website</button>

          <button
            className="ha-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            ⇥ Sign Out
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="hotel-admin-main">
        {/* TOP BAR */}

        <header className="ha-topbar">
          <div>
            <div className="ha-breadcrumb">
              Administration
              <span>/</span>
              Hotel Admins
            </div>

            <h1>Hotel Administrators</h1>
          </div>

          <div className="ha-topbar-right">
            <div className="ha-system-status">
              <span></span>
              System active
            </div>

            <div className="ha-top-avatar">A</div>
          </div>
        </header>

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <section className="ha-page-header">
          <div>
            <span className="ha-page-label">TEAM MANAGEMENT</span>

            <h2>Manage Hotel Administrators</h2>

            <p>
              Create, assign and manage administrators responsible for
              individual hotels.
            </p>
          </div>

          <button className="ha-add-button" onClick={openAddModal}>
            <span>＋</span>
            Add Hotel Admin
          </button>
        </section>

        {/* =================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="ha-alert error">
            <div>!</div>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="ha-alert success">
            <div>✓</div>
            <span>{success}</span>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================== */}

        <section className="ha-stats">
          <div className="ha-stat-card">
            <div className="ha-stat-icon blue">♙</div>

            <div>
              <span>Total Administrators</span>

              <strong>{loading ? "—" : totalAdmins}</strong>

              <small>Hotel management team</small>
            </div>
          </div>

          <div className="ha-stat-card">
            <div className="ha-stat-icon green">✓</div>

            <div>
              <span>Assigned</span>

              <strong>{loading ? "—" : assignedAdmins}</strong>

              <small>Administrators with hotels</small>
            </div>
          </div>

          <div className="ha-stat-card">
            <div className="ha-stat-icon orange">!</div>

            <div>
              <span>Unassigned</span>

              <strong>{loading ? "—" : unassignedAdmins}</strong>

              <small>Need hotel assignment</small>
            </div>
          </div>

          <div className="ha-stat-card">
            <div className="ha-stat-icon purple">▣</div>

            <div>
              <span>Hotels</span>

              <strong>{loading ? "—" : hotels.length}</strong>

              <small>Available properties</small>
            </div>
          </div>
        </section>

        {/* =================================================
            TABLE SECTION
        ================================================== */}

        <section className="ha-content-card">
          <div className="ha-content-header">
            <div>
              <span className="ha-content-label">ADMINISTRATOR DIRECTORY</span>

              <h3>Hotel Admin Accounts</h3>
            </div>

            <div className="ha-header-actions">
              <div className="ha-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search name, email or hotel..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                {search && <button onClick={() => setSearch("")}>×</button>}
              </div>

              <button className="ha-refresh" onClick={loadData} title="Refresh">
                ↻
              </button>
            </div>
          </div>

          {/* TABLE */}

          {loading ? (
            <div className="ha-loading">
              <div className="ha-spinner"></div>

              <p>Loading hotel administrators...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="ha-empty">
              <div className="ha-empty-icon">♙</div>

              <h3>
                {search
                  ? "No administrators found"
                  : "No hotel administrators yet"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : "Create your first hotel administrator to get started."}
              </p>

              {!search && (
                <button onClick={openAddModal}>＋ Add Hotel Admin</button>
              )}
            </div>
          ) : (
            <div className="ha-table-wrapper">
              <table className="ha-table">
                <thead>
                  <tr>
                    <th>ADMINISTRATOR</th>
                    <th>ASSIGNED HOTEL</th>
                    <th>LOCATION</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map((admin) => {
                    const hotel = getHotel(admin);

                    return (
                      <tr key={admin._id}>
                        {/* ADMIN */}

                        <td>
                          <div className="ha-user">
                            <div className="ha-user-avatar">
                              {getInitial(admin.name)}
                            </div>

                            <div>
                              <strong>{admin.name}</strong>

                              <span>{admin.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* HOTEL */}

                        <td>
                          {hotel ? (
                            <div className="ha-hotel">
                              <div className="ha-hotel-icon">▣</div>

                              <div>
                                <strong>{hotel.name}</strong>

                                <span>{hotel.rooms || 0} rooms</span>
                              </div>
                            </div>
                          ) : (
                            <span className="ha-not-assigned">
                              Not assigned
                            </span>
                          )}
                        </td>

                        {/* LOCATION */}

                        <td>
                          <div className="ha-location">
                            <span>⌖</span>

                            {hotel?.location || "—"}
                          </div>
                        </td>

                        {/* ROLE */}

                        <td>
                          <span className="ha-role">Hotel Admin</span>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span className="ha-status">
                            <i></i>
                            Active
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="ha-actions">
                            <button
                              className="ha-edit"
                              onClick={() => openEditModal(admin)}
                              title="Edit administrator"
                            >
                              ✎
                            </button>

                            <button
                              className="ha-delete"
                              onClick={() => handleDelete(admin)}
                              title="Delete administrator"
                            >
                              ×
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

          {!loading && filteredAdmins.length > 0 && (
            <div className="ha-table-footer">
              <span>
                Showing <strong>{filteredAdmins.length}</strong> of{" "}
                <strong>{admins.length}</strong> administrators
              </span>

              <span>Hotel Admin Management</span>
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer className="ha-footer">
          <div>
            <strong>StayHub</strong>
            <span>Hotel Management System</span>
          </div>

          <span>© 2026 StayHub · Administration</span>
        </footer>
      </main>

      {/* =====================================================
          MODAL
      ====================================================== */}

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
                <span className="ha-modal-label">
                  {editingAdmin ? "ACCOUNT SETTINGS" : "NEW ACCOUNT"}
                </span>

                <h2>{editingAdmin ? "Edit Hotel Admin" : "Add Hotel Admin"}</h2>

                <p>
                  {editingAdmin
                    ? "Update administrator information and hotel assignment."
                    : "Create an administrator account and assign a hotel."}
                </p>
              </div>

              <button className="ha-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            {error && <div className="ha-modal-error">{error}</div>}

            <form className="ha-form" onSubmit={handleSubmit}>
              {/* NAME */}

              <div className="ha-form-group">
                <label>Administrator Name</label>

                <div className="ha-input-wrapper">
                  <span>♙</span>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="ha-form-group">
                <label>Email Address</label>

                <div className="ha-input-wrapper">
                  <span>@</span>

                  <input
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="ha-form-group">
                <label>
                  Password
                  {editingAdmin && (
                    <small>Leave blank to keep current password</small>
                  )}
                </label>

                <div className="ha-input-wrapper">
                  <span>●</span>

                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editingAdmin ? "Enter new password" : "Create password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* HOTEL */}

              <div className="ha-form-group">
                <label>Assign Hotel</label>

                <div className="ha-input-wrapper">
                  <span>▣</span>

                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleChange}
                  >
                    <option value="">Select a hotel</option>

                    {hotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                        {hotel.location ? ` — ${hotel.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ha-modal-info">
                <span>i</span>

                <p>
                  This administrator will be able to manage bookings and
                  information for the assigned hotel.
                </p>
              </div>

              <div className="ha-form-actions">
                <button
                  type="button"
                  className="ha-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" className="ha-submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
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
}

export default HotelAdminManagement;
