const crypto = require("crypto");
const Booking = require("../models/Booking");

const CHAPA_BASE_URL = "https://api.chapa.co/v1";

// =====================================================
// HELPER: GET AUTHENTICATED USER ID
// =====================================================

const getUserId = (req) => req.user?._id || req.user?.id;

// =====================================================
// HELPER: REMOVE TRAILING SLASH FROM URL
// =====================================================

const cleanUrl = (url) => String(url || "").replace(/\/$/, "");

// =====================================================
// HELPER: VERIFY PAYMENT DIRECTLY WITH CHAPA
// Never trust the browser redirect as proof of payment.
// =====================================================

const verifyWithChapa = async (txRef) => {
  if (!process.env.CHAPA_SECRET_KEY) {
    throw new Error("Chapa secret key is not configured.");
  }

  const response = await fetch(
    `${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
    },
  );

  const result = await response.json();

  if (!response.ok || result.status !== "success" || !result.data) {
    throw new Error(result.message || "Unable to verify payment with Chapa.");
  }

  return result.data;
};

// =====================================================
// HELPER: VERIFY AND UPDATE BOOKING
// =====================================================

const verifyAndUpdateBooking = async (txRef) => {
  const booking = await Booking.findOne({
    paymentReference: txRef,
  });

  if (!booking) {
    throw new Error("Booking payment reference not found.");
  }

  // Do not overwrite an already verified payment.
  if (booking.paymentStatus === "paid") {
    return booking;
  }

  const paymentData = await verifyWithChapa(txRef);

  const verifiedAmount = Number(paymentData.amount);
  const expectedAmount = Number(booking.totalPrice);

  const verifiedCurrency = String(paymentData.currency || "").toUpperCase();

  const expectedCurrency = String(
    booking.paymentCurrency || "ETB",
  ).toUpperCase();

  const verifiedReference = String(paymentData.tx_ref || "");

  // Check transaction reference.
  if (verifiedReference !== txRef) {
    throw new Error("Payment reference does not match.");
  }

  // Check payment amount.
  if (
    !Number.isFinite(verifiedAmount) ||
    Math.abs(verifiedAmount - expectedAmount) > 0.01
  ) {
    throw new Error("Verified payment amount does not match booking amount.");
  }

  // Check payment currency.
  if (verifiedCurrency !== expectedCurrency) {
    throw new Error("Payment currency does not match booking currency.");
  }

  const transactionStatus = String(paymentData.status || "").toLowerCase();

  if (transactionStatus === "success") {
    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.processorReference = paymentData.reference || null;

    if (paymentData.method) {
      booking.paymentMethod = paymentData.method;
    }

    await booking.save();
  } else if (transactionStatus === "failed") {
    booking.paymentStatus = "failed";
    await booking.save();
  }

  return booking;
};

// =====================================================
// INITIALIZE CHAPA PAYMENT
// POST /api/payments/initialize/:bookingId
// =====================================================

exports.initializePayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!process.env.CHAPA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Payment service is not configured.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    }).populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "You cannot pay for a cancelled booking.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid.",
      });
    }

    if (!booking.user || !booking.user.email || !booking.user.name) {
      return res.status(400).json({
        success: false,
        message: "Customer name and email are required.",
      });
    }

    const amount = Number(booking.totalPrice);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking payment amount.",
      });
    }

    // Reuse an existing pending checkout link.
    if (
      booking.paymentStatus === "pending" &&
      booking.paymentReference &&
      booking.checkoutUrl
    ) {
      return res.status(200).json({
        success: true,
        message: "Existing payment checkout found.",
        checkoutUrl: booking.checkoutUrl,
        tx_ref: booking.paymentReference,
        amount: booking.totalPrice,
        currency: booking.paymentCurrency || "ETB",
      });
    }

    // Generate a unique transaction reference.
    const txRef = `STAYORA-${booking._id}-${crypto.randomUUID()}`;

    const nameParts = booking.user.name.trim().split(/\s+/);

    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "Stayora";

    const frontendUrl = cleanUrl(
      process.env.FRONTEND_URL || "http://localhost:5174",
    );

    const backendUrl = cleanUrl(
      process.env.BACKEND_URL || "http://localhost:5000",
    );

    const payload = {
      amount: amount.toFixed(2),
      currency: booking.paymentCurrency || "ETB",
      email: booking.user.email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,

      callback_url: `${backendUrl}/api/payments/callback`,

      return_url: `${frontendUrl}/payment/result?tx_ref=${encodeURIComponent(
        txRef,
      )}`,

      customization: {
        title: "Stayora Hotel Booking",
        description: `Payment for booking ${booking._id}`,
      },
    };

    const chapaResponse = await fetch(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      },
    );

    const chapaData = await chapaResponse.json();

    if (
      !chapaResponse.ok ||
      chapaData.status !== "success" ||
      !chapaData.data?.checkout_url
    ) {
      console.error("CHAPA INITIALIZATION ERROR:", chapaData);

      return res.status(502).json({
        success: false,
        message: chapaData.message || "Unable to initialize Chapa payment.",
      });
    }

    // Save payment information.
    booking.paymentStatus = "pending";
    booking.paymentProvider = "chapa";
    booking.paymentReference = txRef;
    booking.merchantReference = txRef;
    booking.checkoutUrl = chapaData.data.checkout_url;
    booking.paymentCurrency = booking.paymentCurrency || "ETB";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      checkoutUrl: booking.checkoutUrl,
      tx_ref: txRef,
      amount: booking.totalPrice,
      currency: booking.paymentCurrency,
    });
  } catch (error) {
    console.error("INITIALIZE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to initialize payment.",
    });
  }
};

// =====================================================
// VERIFY PAYMENT
// GET /api/payments/verify/:tx_ref
// =====================================================

exports.verifyPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { tx_ref: txRef } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!txRef) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required.",
      });
    }

    // Confirm that this transaction belongs to the logged-in user.
    const booking = await Booking.findOne({
      paymentReference: txRef,
      user: userId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Payment not found or access denied.",
      });
    }

    const updatedBooking = await verifyAndUpdateBooking(txRef);

    return res.status(200).json({
      success: true,
      message:
        updatedBooking.paymentStatus === "paid"
          ? "Payment verified successfully."
          : "Payment has not been completed.",
      paymentStatus: updatedBooking.paymentStatus,
      bookingId: updatedBooking._id,
      amount: updatedBooking.totalPrice,
      currency: updatedBooking.paymentCurrency,
      paidAt: updatedBooking.paidAt,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Payment verification failed.",
    });
  }
};

// =====================================================
// CHAPA CALLBACK
// GET /api/payments/callback
// =====================================================

exports.chapaCallback = async (req, res) => {
  const frontendUrl = cleanUrl(
    process.env.FRONTEND_URL || "http://localhost:5174",
  );

  try {
    const txRef = req.query.trx_ref || req.query.tx_ref;

    if (!txRef) {
      return res.redirect(
        `${frontendUrl}/payment/result?status=missing_reference`,
      );
    }

    // Verify directly with Chapa before updating the booking.
    const booking = await verifyAndUpdateBooking(txRef);

    return res.redirect(
      `${frontendUrl}/payment/result?tx_ref=${encodeURIComponent(
        txRef,
      )}&status=${encodeURIComponent(booking.paymentStatus)}`,
    );
  } catch (error) {
    console.error("CHAPA CALLBACK ERROR:", error);

    return res.redirect(
      `${frontendUrl}/payment/result?status=verification_failed`,
    );
  }
};

// =====================================================
// GET PAYMENT RECEIPT
// GET /api/payments/receipt/:bookingId
// =====================================================

exports.getPaymentReceipt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate("user", "name email")
      .populate("hotel", "name location");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied.",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        success: false,
        message: "A receipt is available only after successful payment.",
        paymentStatus: booking.paymentStatus,
      });
    }

    return res.status(200).json({
      success: true,
      receipt: {
        receiptNumber: `STAYORA-${booking._id}`,
        transactionReference: booking.paymentReference,
        processorReference: booking.processorReference,
        paymentProvider: booking.paymentProvider,
        customer: booking.user?.name,
        customerEmail: booking.user?.email,
        hotel: booking.hotel?.name,
        hotelLocation: booking.hotel?.location,
        bookingId: booking._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        rooms: booking.rooms,
        amount: booking.totalPrice,
        currency: booking.paymentCurrency || "ETB",
        paymentStatus: booking.paymentStatus,
        paidAt: booking.paidAt,
        issuedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("GET PAYMENT RECEIPT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to retrieve payment receipt.",
    });
  }
};
