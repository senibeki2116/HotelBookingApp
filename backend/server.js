require("dotenv").config();

console.log(
  "OpenAI API Key loaded:",
  process.env.OPENAI_API_KEY ? "YES" : "NO",
);

const express = require("express");
const cors = require("cors");
const path = require("path");
const roomRoutes = require("./routes/roomRoutes");
const connectDB = require("./config/db");

// Routes
const hotelRoutes = require("./routes/hotelRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ================================
// DATABASE
// ================================

connectDB();

// ================================
// STATIC FILES
// ================================

app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

// ================================
// API ROUTES
// ================================

app.use("/api/users", userRoutes);

app.use("/api/hotels", hotelRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);

app.use("/api/ai", aiRoutes);

// ================================
// ROOT ROUTE
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "Hotel Booking Backend is Running!",
  });
});

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ================================
// ERROR HANDLER
// ================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
