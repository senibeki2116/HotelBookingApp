const express = require("express");

const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminUserController");

const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");

// ========================================
// ADMIN ROUTE TEST
// ========================================

router.get("/test", (req, res) => {
  res.json({
    message: "ADMIN ROUTES ARE DEFINITELY WORKING",
  });
});

// ========================================
// HOTEL MANAGEMENT
// ========================================

// GET ALL HOTELS
router.get("/hotels", protect, adminOnly, getHotels);

// GET ONE HOTEL
router.get("/hotels/:id", protect, adminOnly, getHotelById);

// CREATE HOTEL
router.post("/hotels", protect, adminOnly, createHotel);

// UPDATE HOTEL
router.put("/hotels/:id", protect, adminOnly, updateHotel);

// DELETE HOTEL
router.delete("/hotels/:id", protect, adminOnly, deleteHotel);

// ========================================
// USER MANAGEMENT
// ========================================

// GET ALL USERS
router.get("/users", protect, adminOnly, getAllUsers);

// DELETE USER
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;
