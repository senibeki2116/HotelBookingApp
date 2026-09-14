const express = require("express");

const router = express.Router();

const { recommendHotels } = require("../controllers/aiController");

// AI hotel recommendation
router.post("/recommend", recommendHotels);

module.exports = router;
