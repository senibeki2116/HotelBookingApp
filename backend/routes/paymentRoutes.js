const express = require("express");

const router = express.Router();

const {
  initializePayment,
  verifyPayment,
  getPaymentReceipt,
  chapaCallback,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

// =====================================================
// CHAPA CALLBACK
// Chapa accesses this endpoint after checkout.
// Verification is performed server-side.
// =====================================================

router.get("/callback", chapaCallback);

// =====================================================
// CUSTOMER - INITIALIZE PAYMENT
// =====================================================

router.post("/initialize/:bookingId", protect, initializePayment);

// =====================================================
// CUSTOMER - VERIFY PAYMENT
// =====================================================

router.get("/verify/:tx_ref", protect, verifyPayment);

// =====================================================
// CUSTOMER - GET PAYMENT RECEIPT
// =====================================================

router.get("/receipt/:bookingId", protect, getPaymentReceipt);

module.exports = router;
