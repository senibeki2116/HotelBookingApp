const express = require("express");

const router = express.Router();

const {
  getMyHotelRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

const { protect } = require("../middleware/authMiddleware");

const hotelAdmin = require("../middleware/hotelAdminMiddleware");

// =========================================================
// GET ALL ROOMS FOR LOGGED-IN HOTEL ADMIN
// =========================================================

router.get("/my-hotel", protect, hotelAdmin, getMyHotelRooms);

// =========================================================
// GET ONE ROOM
// =========================================================

router.get("/:id", protect, hotelAdmin, getRoomById);

// =========================================================
// CREATE ROOM
// =========================================================

router.post("/", protect, hotelAdmin, createRoom);

// =========================================================
// UPDATE ROOM
// =========================================================

router.put("/:id", protect, hotelAdmin, updateRoom);

// =========================================================
// DELETE ROOM
// =========================================================

router.delete("/:id", protect, hotelAdmin, deleteRoom);

module.exports = router;
