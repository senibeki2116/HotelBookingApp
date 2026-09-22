const express = require("express");

const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getBookingById,
  deleteBooking,
  getAllBookings,
  getMyHotelBookings,
} = require("../controllers/bookingController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const hotelAdmin = require("../middleware/hotelAdminMiddleware");

// ==========================
// Create Booking
// ==========================
router.post("/", protect, createBooking);

// ==========================
// ADMIN - Get All Bookings
// ==========================
router.get("/", protect, adminOnly, getAllBookings);

// ==========================
// Get My Bookings - Normal User
// ==========================
router.get("/my", protect, getMyBookings);

// ==========================
// HOTEL ADMIN - Get Assigned Hotel Bookings
// ==========================
router.get("/my-hotel", protect, hotelAdmin, getMyHotelBookings);

// ==========================
// Get Single Booking
// ==========================
router.get("/:id", protect, getBookingById);

// ==========================
// Delete Booking
// ==========================
router.delete("/:id", protect, deleteBooking);

module.exports = router;
