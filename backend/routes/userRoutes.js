const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);

router.post("/login", login);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route success",
    user: req.user,
  });
});

module.exports = router;
