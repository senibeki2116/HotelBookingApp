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

  // Get a consistent ID from strings, MongoDB IDs, or populated objects.
  const getId = (value) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "object") {
      return String(
        value._id ?? value.id ?? value.hotelId ?? value.hotel_id ?? "",
      );
    }

    return String(value);
  };

  // Read the hotel reference from an administrator record.
  const getAdminHotelId = (admin) => {
    const possibleValues = [
      admin.hotelId,
      admin.hotel_id,
      admin.assignedHotelId,
      admin.assigned_hotel_id,
      admin.hotel,
      admin.assignedHotel,
      admin.hotelData,
    ];

    for (const value of possibleValues) {
      const id = getId(value);
      if (id) return id;
    }

    return "";
  };

  // Find the complete hotel record for an administrator.
  const getHotel = (admin) => {
    const possibleHotelObjects = [
      admin.hotel,
      admin.assignedHotel,
      admin.hotelData,
    ];

    for (const value of possibleHotelObjects) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const id = getId(value);

        const matched = hotels.find((hotel) => getId(hotel) === id && id);

        if (matched) return matched;
        if (value.name) return value;
      }
    }

    const hotelId = getAdminHotelId(admin);

    if (hotelId) {
      const matched = hotels.find((hotel) => getId(hotel) === hotelId);

      if (matched) return matched;
    }

    // Some APIs return the hotel name separately.
    if (admin.hotelName || admin.hotel_name) {
      return {
        name: admin.hotelName || admin.hotel_name,
        location:
          admin.hotelLocation || admin.hotel_location || admin.location || "",
        rooms: admin.rooms || 0,
      };
    }

    return null;
  };

  // Load administrators and hotels.
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [adminsResponse, hotelsResponse] = await Promise.all([
        API.get("/users/hotel-admins"),
        API.get("/hotels"),
      ]);

      const adminResponseData = adminsResponse.data;
      const hotelResponseData = hotelsResponse.data;

      const adminData = Array.isArray(adminResponseData)
        ? adminResponseData
        : adminResponseData?.hotelAdmins ||
          adminResponseData?.admins ||
          adminResponseData?.users ||
          adminResponseData?.data ||
          [];

      const hotelData = Array.isArray(hotelResponseData)
        ? hotelResponseData
        : hotelResponseData?.hotels || hotelResponseData?.data || [];

      const normalizedHotels = hotelData.map((hotel) => ({
        ...hotel,
        _id: getId(hotel),
      }));

      const normalizedAdmins = adminData.map((admin) => ({
        ...admin,
        _id: getId(admin),
        hotelId: getAdminHotelId(admin),
      }));

      setHotels(normalizedHotels);
      setAdmins(normalizedAdmins);
    } catch (err) {
      console.error("Hotel admin loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load hotel administrators and hotels.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search administrators and their assigned hotels.
  const filteredAdmins = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return admins;

    return admins.filter((admin) => {
      const hotel = getHotel(admin);

      return [
        admin.name,
        admin.email,
        hotel?.name,
        hotel?.location,
        admin.hotelName,
        admin.hotelLocation,
      ].some((item) =>
        String(item || "")
          .toLowerCase()
          .includes(value),
      );
    });
  }, [admins, hotels, search]);

  const totalAdmins = admins.length;

  const assignedAdmins = admins.filter((admin) =>
    Boolean(getHotel(admin)),
  ).length;

  const unassignedAdmins = totalAdmins - assignedAdmins;

  // Open the create form.
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

  // Open the edit form with the existing assignment selected.
  const openEditModal = (admin) => {
    const hotel = getHotel(admin);

    setEditingAdmin(admin);
    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      hotelId: getId(hotel) || getAdminHotelId(admin),
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAdmin(null);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create or update an administrator.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name) {
      setError("Please enter the administrator name.");
      return;
    }

    if (!email) {
      setError("Please enter the administrator email.");
      return;
    }

    if (!editingAdmin && !password.trim()) {
      setError("Please enter a password.");
      return;
    }

    if (!formData.hotelId) {
      setError("Please select a hotel.");
      return;
    }

    const selectedHotel = hotels.find(
      (hotel) => getId(hotel) === String(formData.hotelId),
    );

    if (!selectedHotel) {
      setError("The selected hotel could not be found. Refresh and try again.");
      return;
    }

    const adminId = getId(editingAdmin);

    if (editingAdmin && !adminId) {
      setError("Unable to identify this administrator.");
      return;
    }

    const payload = {
      name,
      email,
      hotelId: String(formData.hotelId),
    };

    if (password.trim()) {
      payload.password = password;
    }

    try {
      setSaving(true);

      if (editingAdmin) {
        await API.put(`/users/hotel-admins/${adminId}`, payload);
      } else {
        await API.post("/users/create-hotel-admin", {
          ...payload,
          password,
        });
      }

      setSuccess(
        editingAdmin
          ? "Administrator updated successfully."
          : "Administrator created successfully.",
      );

      await loadData();

      setTimeout(() => {
        setShowModal(false);
        setEditingAdmin(null);
        setSuccess("");
      }, 900);
    } catch (err) {
      console.error("Save hotel admin error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save the administrator or hotel assignment.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete an administrator.
  const handleDelete = async (admin) => {
    const adminId = getId(admin);

    if (!adminId) {
      setError("Unable to identify the administrator to delete.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name || "this administrator"}?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await API.delete(`/users/hotel-admins/${adminId}`);

      setSuccess("Administrator deleted successfully.");
      await loadData();

      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      console.error("Delete hotel admin error:", err);

      setError(
        err.response?.data?.message || "Unable to delete the administrator.",
      );
    }
  };

  const getInitial = (name) =>
    String(name || "A")
      .charAt(0)
      .toUpperCase();

  return (
    <div className="hotel-admin-page">
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
            <span>⌂</span> Dashboard
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/manage-hotels")}
          >
            <span>▣</span> Hotels
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/bookings")}
          >
            <span>▤</span> Bookings
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/users")}
          >
            <span>◉</span> Users
          </button>

          <div className="ha-nav-label">MANAGEMENT</div>

          <button className="ha-nav-item active">
            <span>♙</span> Hotel Admins
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/reports")}
          >
            <span>◫</span> Reports
          </button>

          <button
            className="ha-nav-item"
            onClick={() => navigate("/admin/add-hotel")}
          >
            <span>＋</span> Add Hotel
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

      <main className="hotel-admin-main">
        <header className="ha-topbar">
          <div>
            <div className="ha-breadcrumb">
              Administration <span>/</span> Hotel Admins
            </div>
            <h1>Hotel Administrators</h1>
          </div>

          <div className="ha-topbar-right">
            <div className="ha-system-status">
              <span></span> System active
            </div>
            <div className="ha-top-avatar">A</div>
          </div>
        </header>

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
            <span>＋</span> Add Hotel Admin
          </button>
        </section>

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

              <button
                className="ha-refresh"
                onClick={loadData}
                title="Refresh"
                disabled={loading}
              >
                ↻
              </button>
            </div>
          </div>

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
                  {filteredAdmins.map((admin, index) => {
                    const hotel = getHotel(admin);
                    const adminKey =
                      getId(admin) || `${admin.email || "admin"}-${index}`;

                    return (
                      <tr key={adminKey}>
                        <td>
                          <div className="ha-user">
                            <div className="ha-user-avatar">
                              {getInitial(admin.name)}
                            </div>
                            <div>
                              <strong>{admin.name || "Unnamed admin"}</strong>
                              <span>{admin.email || "No email"}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          {hotel ? (
                            <div className="ha-hotel">
                              <div className="ha-hotel-icon">▣</div>
                              <div>
                                <strong>
                                  {hotel.name || "Assigned hotel"}
                                </strong>
                                <span>
                                  {hotel.rooms ??
                                    hotel.roomCount ??
                                    hotel.totalRooms ??
                                    0}{" "}
                                  rooms
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="ha-not-assigned">
                              Not assigned
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="ha-location">
                            <span>⌖</span>
                            {hotel?.location ||
                              hotel?.city ||
                              hotel?.address ||
                              "—"}
                          </div>
                        </td>

                        <td>
                          <span className="ha-role">Hotel Admin</span>
                        </td>

                        <td>
                          <span className="ha-status">
                            <i></i>
                            {admin.status || "Active"}
                          </span>
                        </td>

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

        <footer className="ha-footer">
          <div>
            <strong>StayHub</strong>
            <span>Hotel Management System</span>
          </div>
          <span>© 2026 StayHub · Administration</span>
        </footer>
      </main>

      {showModal && (
        <div
          className="ha-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
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

              <button
                className="ha-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && <div className="ha-modal-error">{error}</div>}

            <form className="ha-form" onSubmit={handleSubmit}>
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
                    required
                  />
                </div>
              </div>

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
                    required
                  />
                </div>
              </div>

              <div className="ha-form-group">
                <label>
                  Password{" "}
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
                    required={!editingAdmin}
                  />
                </div>
              </div>

              <div className="ha-form-group">
                <label>Assign Hotel</label>
                <div className="ha-input-wrapper">
                  <span>▣</span>
                  <select
                    name="hotelId"
                    value={formData.hotelId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a hotel</option>
                    {hotels.map((hotel, index) => (
                      <option key={getId(hotel) || index} value={getId(hotel)}>
                        {hotel.name || "Unnamed hotel"}
                        {hotel.location ? ` — ${hotel.location}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {hotels.length === 0 && (
                  <small>
                    No hotels were returned by the API. Add a hotel first.
                  </small>
                )}
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

                <button
                  type="submit"
                  className="ha-submit"
                  disabled={saving || hotels.length === 0}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : editingAdmin ? (
                    "Save Changes"
                  ) : (
                    "Create Administrator"
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
