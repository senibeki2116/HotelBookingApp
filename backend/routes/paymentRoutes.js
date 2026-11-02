const express = require("express");
const router = express.Router();

const {
  initializePayment,
  verifyPayment,
  getPaymentReceipt,
  chapaCallback,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

router.get("/callback", chapaCallback);

router.post("/initialize/:bookingId", protect, initializePayment);
router.get("/verify/:tx_ref", protect, verifyPayment);
router.get("/receipt/:bookingId", protect, getPaymentReceipt);

module.exports = router;
