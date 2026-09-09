const express = require("express");

const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  deleteBooking,
  getAllBookings,
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ==========================
// Create Booking
// ==========================
router.post("/", protect, createBooking);

// ==========================
// ADMIN - Get All Bookings
// ==========================
router.get("/", protect, adminOnly, getAllBookings);

// ==========================
// Get My Bookings
// ==========================
router.get("/my", protect, getMyBookings);

// ==========================
// Get Single Booking
// ==========================
router.get("/:id", protect, getBookingById);

// ==========================
// Delete Booking
// ==========================
router.delete("/:id", protect, deleteBooking);

module.exports = router;
