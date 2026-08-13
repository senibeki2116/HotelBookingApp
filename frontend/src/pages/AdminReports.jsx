import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminReports.css";

const AdminReports = () => {
  const navigate = useNavigate();

  return (
    <div className="reports-page">
      {/* ================= HEADER ================= */}
      <div className="reports-header">
        <div className="reports-header-left">
          <span className="reports-label">ANALYTICS CENTER</span>

          <h1>Reports & Analytics</h1>

          <p>Monitor your hotel business performance, bookings and revenue.</p>
        </div>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="reports-toolbar">
        <div>
          <h2>Business Overview</h2>
          <p>Performance summary for your hotel platform</p>
        </div>

        <select className="period-select">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
      </div>

      {/* ================= STATISTICS ================= */}
      <section className="reports-stats">
        <div className="report-stat-card">
          <div className="report-stat-icon purple">🏨</div>

          <div>
            <span>Total Hotels</span>
            <h2>10</h2>
            <small className="positive">↑ 12% from last month</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon blue">📅</div>

          <div>
            <span>Total Bookings</span>
            <h2>25</h2>
            <small className="positive">↑ 18% from last month</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green">👥</div>

          <div>
            <span>Total Users</span>
            <h2>15</h2>
            <small className="positive">↑ 8% from last month</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">💰</div>

          <div>
            <span>Total Revenue</span>
            <h2>ETB 12,450</h2>
            <small className="positive">↑ 24% from last month</small>
          </div>
        </div>
      </section>

      {/* ================= MAIN ANALYTICS ================= */}
      <section className="analytics-grid">
        {/* Revenue Chart */}
        <div className="analytics-card revenue-card">
          <div className="card-heading">
            <div>
              <span className="card-label">REVENUE</span>
              <h2>Revenue Overview</h2>
              <p>Monthly revenue performance</p>
            </div>

            <strong>ETB 12,450</strong>
          </div>

          <div className="chart">
            <div className="chart-y-axis">
              <span>15K</span>
              <span>10K</span>
              <span>5K</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="grid-line line-1"></div>
              <div className="grid-line line-2"></div>
              <div className="grid-line line-3"></div>
              <div className="grid-line line-4"></div>

              <div className="bars">
                <div className="bar-container">
                  <div className="bar" style={{ height: "35%" }}></div>
                  <span>Jan</span>
                </div>

                <div className="bar-container">
                  <div className="bar" style={{ height: "48%" }}></div>
                  <span>Feb</span>
                </div>

                <div className="bar-container">
                  <div className="bar" style={{ height: "42%" }}></div>
                  <span>Mar</span>
                </div>

                <div className="bar-container">
                  <div className="bar" style={{ height: "65%" }}></div>
                  <span>Apr</span>
                </div>

                <div className="bar-container">
                  <div className="bar" style={{ height: "58%" }}></div>
                  <span>May</span>
                </div>

                <div className="bar-container">
                  <div className="bar" style={{ height: "78%" }}></div>
                  <span>Jun</span>
                </div>

                <div className="bar-container">
                  <div className="bar active" style={{ height: "90%" }}></div>
                  <span>Jul</span>
                </div>

                <div className="bar-container">
                  <div className="bar current" style={{ height: "72%" }}></div>
                  <span>Aug</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="analytics-card booking-summary">
          <div className="card-heading">
            <div>
              <span className="card-label">BOOKINGS</span>
              <h2>Booking Summary</h2>
              <p>Current booking status</p>
            </div>
          </div>

          <div className="booking-circle">
            <div className="circle-inner">
              <strong>25</strong>
              <span>Total</span>
            </div>
          </div>

          <div className="booking-legend">
            <div>
              <span className="legend-dot confirmed-dot"></span>
              <span>Confirmed</span>
              <strong>18</strong>
            </div>

            <div>
              <span className="legend-dot pending-dot"></span>
              <span>Pending</span>
              <strong>5</strong>
            </div>

            <div>
              <span className="legend-dot cancelled-dot"></span>
              <span>Cancelled</span>
              <strong>2</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOWER SECTION ================= */}
      <section className="lower-grid">
        {/* Top Hotels */}
        <div className="analytics-card">
          <div className="card-heading">
            <div>
              <span className="card-label">PERFORMANCE</span>
              <h2>Top Performing Hotels</h2>
              <p>Hotels with the highest bookings</p>
            </div>
          </div>

          <div className="hotel-ranking">
            <div className="hotel-row">
              <div className="rank">01</div>

              <div className="hotel-info">
                <strong>Grand Palace Hotel</strong>
                <span>Addis Ababa</span>
              </div>

              <div className="hotel-bookings">
                <strong>12</strong>
                <span>Bookings</span>
              </div>
            </div>

            <div className="hotel-row">
              <div className="rank">02</div>

              <div className="hotel-info">
                <strong>Luxury Addis Hotel</strong>
                <span>Addis Ababa</span>
              </div>

              <div className="hotel-bookings">
                <strong>8</strong>
                <span>Bookings</span>
              </div>
            </div>

            <div className="hotel-row">
              <div className="rank">03</div>

              <div className="hotel-info">
                <strong>Paradise Grand Hotel</strong>
                <span>Addis Ababa</span>
              </div>

              <div className="hotel-bookings">
                <strong>5</strong>
                <span>Bookings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reports */}
        <div className="analytics-card quick-reports">
          <div className="card-heading">
            <div>
              <span className="card-label">REPORTS</span>
              <h2>Quick Reports</h2>
              <p>Access important system reports</p>
            </div>
          </div>

          <button className="quick-report-btn">
            <span>📅</span>

            <div>
              <strong>Booking Report</strong>
              <small>View all booking activity</small>
            </div>

            <span>→</span>
          </button>

          <button className="quick-report-btn">
            <span>💰</span>

            <div>
              <strong>Revenue Report</strong>
              <small>Analyze your revenue</small>
            </div>

            <span>→</span>
          </button>

          <button className="quick-report-btn">
            <span>👥</span>

            <div>
              <strong>User Report</strong>
              <small>View registered users</small>
            </div>

            <span>→</span>
          </button>

          <button className="quick-report-btn">
            <span>🏨</span>

            <div>
              <strong>Hotel Report</strong>
              <small>Analyze hotel performance</small>
            </div>

            <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
