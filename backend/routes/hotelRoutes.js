const express = require("express");
const router = express.Router();

const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  assignHotelAdmin,
  getMyHotel,
  updateMyHotel,
} = require("../controllers/hotelController");

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const hotelAdmin = require("../middleware/hotelAdminMiddleware");

// ===============================
// PUBLIC ROUTES
// ===============================

// Get all hotels
router.get("/", getHotels);

// ===============================
// HOTEL ADMIN ROUTES
// IMPORTANT: These MUST be before /:id
// ===============================

// Get logged-in hotel admin's hotel
router.get("/my-hotel", protect, hotelAdmin, getMyHotel);

// Update logged-in hotel admin's hotel
router.put("/my-hotel", protect, hotelAdmin, updateMyHotel);

// ===============================
// PUBLIC SINGLE HOTEL ROUTE
// ===============================

// Get hotel by ID
router.get("/:id", getHotelById);

// ===============================
// SUPER ADMIN ROUTES
// ===============================

// Create hotel
router.post("/", protect, admin, createHotel);

// Update any hotel
router.put("/:id", protect, admin, updateHotel);

// Delete hotel
router.delete("/:id", protect, admin, deleteHotel);

// Assign hotel admin
router.put("/:id/assign-admin", protect, admin, assignHotelAdmin);

module.exports = router;
