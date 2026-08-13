import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // ==========================
  // Fetch Users
  // ==========================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      setUsers(response.data);
    } catch (error) {
      console.error("Fetch users error:", error);

      setError(error.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================
  // Delete User
  // ==========================
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`,
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/admin/users/${id}`);

      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== id),
      );

      alert("User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error);

      alert(error.response?.data?.message || "Failed to delete user.");
    }
  };

  // ==========================
  // Change Role
  // ==========================
  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    const confirmChange = window.confirm(
      `Change this user role to ${newRole}?`,
    );

    if (!confirmChange) return;

    try {
      const response = await API.put(`/admin/users/${id}/role`, {
        role: newRole,
      });

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === id
            ? {
                ...user,
                role: response.data.user.role,
              }
            : user,
        ),
      );

      alert("User role updated successfully!");
    } catch (error) {
      console.error("Role update error:", error);

      alert(error.response?.data?.message || "Failed to update user role.");
    }
  };

  // ==========================
  // Search + Filter
  // ==========================
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ==========================
  // Statistics
  // ==========================
  const totalUsers = users.length;

  const totalAdmins = users.filter((user) => user.role === "admin").length;

  const totalRegularUsers = users.filter((user) => user.role === "user").length;

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="users-loading">
          <div className="users-spinner"></div>
          <h3>Loading users...</h3>
          <p>Please wait while we load the user list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      {/* ================= HEADER ================= */}
      <div className="users-header">
        <div className="users-header-left">
          <span className="users-label">ADMIN PANEL</span>

          <h1>User Management</h1>

          <p>
            View, manage and control registered users on your hotel booking
            platform.
          </p>
        </div>

        <button
          className="users-back-btn"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* ================= ERROR ================= */}
      {error && <div className="users-error">⚠️ {error}</div>}

      {/* ================= STATISTICS ================= */}
      <div className="users-stats">
        <div className="user-stat-card">
          <div className="user-stat-icon purple">👥</div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon blue">🛡️</div>

          <div>
            <span>Administrators</span>
            <strong>{totalAdmins}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="user-stat-icon green">👤</div>

          <div>
            <span>Regular Users</span>
            <strong>{totalRegularUsers}</strong>
          </div>
        </div>
      </div>

      {/* ================= USER TABLE CARD ================= */}
      <div className="users-card">
        {/* Toolbar */}
        <div className="users-toolbar">
          <div>
            <h2>Registered Users</h2>
            <p>{filteredUsers.length} users found</p>
          </div>

          <div className="users-controls">
            {/* Search */}
            <div className="user-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-filter"
            >
              <option value="all">All Roles</option>

              <option value="admin">Administrators</option>

              <option value="user">Regular Users</option>
            </select>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <div>👥</div>

            <h3>No users found</h3>

            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const firstLetter =
                    user.name?.charAt(0)?.toUpperCase() || "U";

                  return (
                    <tr key={user._id}>
                      {/* User */}
                      <td>
                        <div className="user-profile">
                          <div className="user-avatar">{firstLetter}</div>

                          <div className="user-name">
                            <strong>{user.name || "Unknown User"}</strong>

                            <span>ID: {user._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="user-email">{user.email}</span>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className={`role-badge ${
                            user.role === "admin" ? "admin-role" : "user-role"
                          }`}
                        >
                          {user.role === "admin" ? "🛡️ Admin" : "👤 User"}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="active-status">
                          <span></span>
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="user-actions">
                          <button
                            className="role-btn"
                            onClick={() =>
                              handleRoleChange(user._id, user.role)
                            }
                          >
                            {user.role === "admin" ? "Make User" : "Make Admin"}
                          </button>

                          <button
                            className="delete-user-btn"
                            onClick={() => handleDelete(user._id, user.name)}
                          >
                            🗑
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
      </div>
    </div>
  );
};

export default AdminUsers;
