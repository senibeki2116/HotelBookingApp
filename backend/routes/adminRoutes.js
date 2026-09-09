const express = require("express");

const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminUserController");

const {
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");


// ===============================
// HOTEL MANAGEMENT
// ===============================

router.post(
  "/hotels",
  protect,
  adminOnly,
  createHotel
);

router.put(
  "/hotels/:id",
  protect,
  adminOnly,
  updateHotel
);

router.delete(
  "/hotels/:id",
  protect,
  adminOnly,
  deleteHotel
);


// ===============================
// USER MANAGEMENT
// ===============================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);


module.exports = router;
