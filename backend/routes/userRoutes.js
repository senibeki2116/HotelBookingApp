const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  register,
  login,
  createHotelAdmin,
  getHotelAdmins,
  updateHotelAdmin,
  deleteHotelAdmin,
} = require("../controllers/authController");

// =====================================================
// MIDDLEWARE
// =====================================================

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// =====================================================
// PUBLIC ROUTES
// =====================================================

// Register normal user
router.post("/register", register);

// Login
router.post("/login", login);

// =====================================================
// SUPER ADMIN ONLY
// =====================================================

// Create hotel admin
router.post("/create-hotel-admin", protect, admin, createHotelAdmin);

// Get all hotel admins
router.get("/hotel-admins", protect, admin, getHotelAdmins);

// Update hotel admin
router.put("/hotel-admins/:id", protect, admin, updateHotelAdmin);

// Delete hotel admin
router.delete("/hotel-admins/:id", protect, admin, deleteHotelAdmin);

// =====================================================
// PROFILE
// =====================================================

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route success",
    user: req.user,
  });
});

module.exports = router;
