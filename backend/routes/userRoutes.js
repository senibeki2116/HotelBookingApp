const express = require("express");

const router = express.Router();

const {
  register,
  login,
  createHotelAdmin,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const admin = require("../middleware/adminMiddleware");

// Public routes
router.post("/register", register);

router.post("/login", login);

// Super Admin creates Hotel Admin
router.post("/create-hotel-admin", protect, admin, createHotelAdmin);

// Protected profile route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route success",
    user: req.user,
  });
});

module.exports = router;
