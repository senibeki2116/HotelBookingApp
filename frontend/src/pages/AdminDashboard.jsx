import React from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      {/* ================= HEADER ================= */}
      <header className="admin-header">
        <div className="header-left">
          <span className="dashboard-label">HOTEL MANAGEMENT</span>

          <h1>Admin Dashboard</h1>

          <p>
            Welcome back, Yanet 👋
            <br />
            <span>Here's what's happening with your hotel system today.</span>
          </p>
        </div>

        <div className="admin-profile">
          <div className="profile-avatar">Y</div>

          <div className="profile-info">
            <strong>Yanet</strong>
            <span>Administrator</span>
          </div>

          <div className="profile-dot"></div>
        </div>
      </header>

      {/* ================= STATISTICS ================= */}
      <section className="stats-grid">
        <div className="stat-card hotel-stat">
          <div className="stat-top">
            <div className="stat-icon">🏨</div>
            <span className="stat-trend">+12%</span>
          </div>

          <p>Hotels</p>
          <h2>10</h2>
          <span className="stat-description">Registered hotels</span>
        </div>

        <div className="stat-card booking-stat">
          <div className="stat-top">
            <div className="stat-icon">📅</div>
            <span className="stat-trend">+18%</span>
          </div>

          <p>Bookings</p>
          <h2>25</h2>
          <span className="stat-description">Total bookings</span>
        </div>

        <div className="stat-card users-stat">
          <div className="stat-top">
            <div className="stat-icon">👥</div>
            <span className="stat-trend">+8%</span>
          </div>

          <p>Users</p>
          <h2>15</h2>
          <span className="stat-description">Registered users</span>
        </div>

        <div className="stat-card revenue-stat">
          <div className="stat-top">
            <div className="stat-icon">💰</div>
            <span className="stat-trend">+24%</span>
          </div>

          <p>Revenue</p>
          <h2>$12,450</h2>
          <span className="stat-description">Total revenue</span>
        </div>
      </section>

      {/* ================= QUICK MANAGEMENT ================= */}
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="section-label">CONTROL CENTER</span>
            <h2>Quick Management</h2>
            <p>Manage your hotel booking system</p>
          </div>
        </div>

        <div className="management-grid">
          {/* Hotel Management */}
          <div className="management-card hotel-management">
            <div className="management-icon">🏨</div>

            <div className="management-content">
              <span className="card-number">01</span>

              <h3>Hotel Management</h3>

              <p>Add, update and delete hotels from your booking platform.</p>

              <div className="management-buttons">
                <button
                  className="admin-action"
                  onClick={() => navigate("/admin/add-hotel")}
                >
                  <span>＋</span>
                  Add Hotel
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => navigate("/admin/manage-hotels")}
                >
                  Manage Hotels
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Booking Management */}
          <div className="management-card booking-management">
            <div className="management-icon">📅</div>

            <div className="management-content">
              <span className="card-number">02</span>

              <h3>Booking Management</h3>

              <p>View and manage all hotel bookings from one place.</p>

              <div className="management-buttons">
                <button
                  className="primary-btn"
                  onClick={() => navigate("/admin/bookings")}
                >
                  View Bookings
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="management-card user-management">
            <div className="management-icon">👥</div>

            <div className="management-content">
              <span className="card-number">03</span>

              <h3>User Management</h3>

              <p>View and manage registered users on the platform.</p>

              <div className="management-buttons">
                <button
                  className="primary-btn"
                  onClick={() => navigate("/admin/users")}
                >
                  Manage Users
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="management-card reports-management">
            <div className="management-icon">📊</div>

            <div className="management-content">
              <span className="card-number">04</span>

              <h3>Reports & Analytics</h3>

              <p>Monitor bookings, revenue and system activity.</p>

              <div className="management-buttons">
                <button
                  className="primary-btn"
                  onClick={() => navigate("/admin/reports")}
                >
                  View Reports
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RECENT BOOKINGS ================= */}
      <section className="recent-section">
        <div className="section-heading">
          <div>
            <span className="section-label">ACTIVITY</span>

            <h2>Recent Bookings</h2>

            <p>Latest activity in your hotel system</p>
          </div>

          <button className="view-all-btn">View All →</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>GUEST</th>
                <th>HOTEL</th>
                <th>CHECK-IN</th>
                <th>CHECK-OUT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>
                  <div className="guest">
                    <div className="guest-avatar">A</div>

                    <div>
                      <strong>Abebe</strong>
                      <small>Guest</small>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>Grand Hotel</strong>
                </td>

                <td>Aug 12, 2026</td>

                <td>Aug 15, 2026</td>

                <td>
                  <span className="status confirmed">● Confirmed</span>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="guest">
                    <div className="guest-avatar">H</div>

                    <div>
                      <strong>Hana</strong>
                      <small>Guest</small>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>Paradise Resort</strong>
                </td>

                <td>Aug 14, 2026</td>

                <td>Aug 17, 2026</td>

                <td>
                  <span className="status pending">● Pending</span>
                </td>
              </tr>

              <tr>
                <td>
                  <div className="guest">
                    <div className="guest-avatar">B</div>

                    <div>
                      <strong>Bereket</strong>
                      <small>Guest</small>
                    </div>
                  </div>
                </td>

                <td>
                  <strong>Haile Resort</strong>
                </td>

                <td>Aug 15, 2026</td>

                <td>Aug 18, 2026</td>

                <td>
                  <span className="status confirmed">● Confirmed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
