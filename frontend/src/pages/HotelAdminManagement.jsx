import React, { useEffect, useState } from "react";
import API from "../api/axios";
import "./HotelAdminManagement.css";

function HotelAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hotelId: "",
  });

  // ============================================
  // LOAD HOTEL ADMINS
  // ============================================
  const fetchAdmins = async () => {
    try {
      setLoading(true);

      const response = await API.get("/users/hotel-admins");

      setAdmins(response.data || []);
    } catch (error) {
      console.error("Error loading hotel admins:", error);

      alert(
        error.response?.data?.message || "Failed to load hotel administrators",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAD HOTELS
  // ============================================
  const fetchHotels = async () => {
    try {
      const response = await API.get("/hotels");

      const hotelData = Array.isArray(response.data)
        ? response.data
        : response.data.hotels || [];

      setHotels(hotelData);
    } catch (error) {
      console.error("Error loading hotels:", error);

      alert(error.response?.data?.message || "Failed to load hotels");
    }
  };

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    fetchAdmins();
    fetchHotels();
  }, []);

  // ============================================
  // HANDLE INPUT
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      hotelId: "",
    });

    setEditingAdmin(null);
    setShowForm(false);
  };

  // ============================================
  // OPEN CREATE FORM
  // ============================================
  const handleAddAdmin = () => {
    setEditingAdmin(null);

    setFormData({
      name: "",
      email: "",
      password: "",
      hotelId: "",
    });

    setShowForm(true);
  };

  // ============================================
  // OPEN EDIT FORM
  // ============================================
  const handleEdit = (admin) => {
    setEditingAdmin(admin);

    setFormData({
      name: admin.name || "",
      email: admin.email || "",
      password: "",
      hotelId: admin.hotel?.id || "",
    });

    setShowForm(true);
  };

  // ============================================
  // CREATE / UPDATE ADMIN
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Name and email are required.");
      return;
    }

    if (!editingAdmin && !formData.password) {
      alert("Password is required when creating a hotel admin.");
      return;
    }

    try {
      setSaving(true);

      if (editingAdmin) {
        // ==========================
        // UPDATE
        // ==========================
        const data = {
          name: formData.name,
          email: formData.email,
          hotelId: formData.hotelId || null,
        };

        if (formData.password) {
          data.password = formData.password;
        }

        await API.put(`/users/hotel-admins/${editingAdmin.id}`, data);

        alert("Hotel admin updated successfully.");
      } else {
        // ==========================
        // CREATE
        // ==========================
        await API.post("/users/create-hotel-admin", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          hotelId: formData.hotelId || null,
        });

        alert("Hotel admin created successfully.");
      }

      resetForm();
      fetchAdmins();
      fetchHotels();
    } catch (error) {
      console.error("Save hotel admin error:", error);

      alert(error.response?.data?.message || "Failed to save hotel admin");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE ADMIN
  // ============================================
  const handleDelete = async (adminId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hotel admin?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/users/hotel-admins/${adminId}`);

      alert("Hotel admin deleted successfully.");

      fetchAdmins();
      fetchHotels();
    } catch (error) {
      console.error("Delete hotel admin error:", error);

      alert(error.response?.data?.message || "Failed to delete hotel admin");
    }
  };

  return (
    <div className="hotel-admin-page">
      {/* ========================================
          HEADER
      ======================================== */}
      <div className="hotel-admin-header">
        <div>
          <h1>Hotel Admin Management</h1>

          <p>Create, manage, and assign administrators to hotels.</p>
        </div>

        <button className="add-admin-btn" onClick={handleAddAdmin}>
          + Add Hotel Admin
        </button>
      </div>

      {/* ========================================
          FORM
      ======================================== */}
      {showForm && (
        <div className="hotel-admin-form-card">
          <div className="form-header">
            <h2>{editingAdmin ? "Edit Hotel Admin" : "Create Hotel Admin"}</h2>

            <button
              className="close-form-btn"
              onClick={resetForm}
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* NAME */}
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label>
                  Password{" "}
                  {editingAdmin && (
                    <span className="optional">
                      (leave empty to keep current password)
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingAdmin ? "Enter new password" : "Enter password"
                  }
                  required={!editingAdmin}
                />
              </div>

              {/* HOTEL */}
              <div className="form-group">
                <label>Assign Hotel</label>

                <select
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleChange}
                >
                  <option value="">-- No Hotel Assigned --</option>

                  {hotels.map((hotel) => {
                    const hotelId = hotel._id || hotel.id;

                    return (
                      <option key={hotelId} value={hotelId}>
                        {hotel.name} - {hotel.location}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* FORM BUTTONS */}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingAdmin
                    ? "Update Admin"
                    : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================
          ADMIN TABLE
      ======================================== */}
      <div className="hotel-admin-table-card">
        <div className="table-header">
          <div>
            <h2>Hotel Administrators</h2>

            <p>
              {admins.length} administrator
              {admins.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Loading hotel administrators...</div>
        ) : admins.length === 0 ? (
          <div className="empty-message">
            <h3>No Hotel Admins Found</h3>

            <p>
              Click "Add Hotel Admin" to create the first hotel administrator.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="hotel-admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Assigned Hotel</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{admin.name}</strong>
                    </td>

                    <td>{admin.email}</td>

                    <td>
                      {admin.hotel ? (
                        <span className="hotel-name">{admin.hotel.name}</span>
                      ) : (
                        <span className="not-assigned">Not Assigned</span>
                      )}
                    </td>

                    <td>{admin.hotel?.location || "-"}</td>

                    <td>
                      <span className="role-badge">Hotel Admin</span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(admin)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(admin.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HotelAdminManagement;
