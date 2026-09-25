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

// Customer - create booking
router.post("/", protect, createBooking);

// Super Admin - all bookings
router.get("/", protect, adminOnly, getAllBookings);

// Customer - my bookings
router.get("/my", protect, getMyBookings);

// Hotel Admin - my hotel bookings
router.get("/my-hotel", protect, hotelAdmin, getMyHotelBookings);

// Single booking
router.get("/:id", protect, getBookingById);

// Delete booking
router.delete("/:id", protect, deleteBooking);

module.exports = router;
