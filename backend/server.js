require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const roomRoutes = require("./routes/roomRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

const connectDB = require("./config/db");

console.log("=================================");
console.log("🔥 SERVER.JS IS RUNNING");
console.log("🔥 SERVER FILE:", __filename);
console.log("=================================");

console.log("🔥 ADMIN ROUTES OBJECT:", typeof adminRoutes);

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// DATABASE
// ========================================

connectDB();

// ========================================
// STATIC FILES
// ========================================

app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// ========================================
// API ROUTES
// ========================================

app.use("/api/users", userRoutes);

app.use("/api/hotels", hotelRoutes);

app.use("/api/bookings", bookingRoutes);

console.log("🔥 REGISTERING ADMIN ROUTES");

app.use("/api/admin", adminRoutes);

console.log("🔥 ADMIN ROUTES REGISTERED");

app.use("/api/rooms", roomRoutes);

app.use("/api/ai", aiRoutes);

// ========================================
// ADMIN TEST ROUTE
// ========================================

app.get("/admin-test", (req, res) => {
  res.json({
    message: "SERVER.JS TEST ROUTE WORKS",
  });
});

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "Hotel Booking Backend is Running!",
  });
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  console.log("❌ 404 REQUEST:");
  console.log("METHOD:", req.method);
  console.log("URL:", req.originalUrl);

  res.status(404).json({
    message: "Route not found",
    method: req.method,
    url: req.originalUrl,
  });
});

// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Server file: ${__filename}`);
  console.log("=================================");
});
