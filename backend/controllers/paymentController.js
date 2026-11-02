const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");

const CHAPA_BASE_URL = "https://api.chapa.global/v2";
const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

const getUserId = (req) => req.user?._id || req.user?.id;

const isValidBookingId = (id) => mongoose.Types.ObjectId.isValid(id);

const getChapaHeaders = (idempotencyKey) => ({
  Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
  "Content-Type": "application/json",
  ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
});

const getNameParts = (name = "") => {
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || "Customer",
    last_name: parts.slice(1).join(" ") || "Stayora Customer",
  };
};

// Convert booking amount in ETB to integer cents.
const toChapaAmount = (amount) => Math.round(Number(amount) * 100);

// =====================================================
// VERIFY WITH CHAPA
// =====================================================

const verifyWithChapa = async (reference) => {
  const response = await fetch(
    `${CHAPA_BASE_URL}/payments/${encodeURIComponent(reference)}/verify`,
    {
      method: "GET",
      headers: getChapaHeaders(),
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Chapa verification failed (${response.status}).`,
    );
  }

  return result;
};

// =====================================================
// UPDATE BOOKING ONLY AFTER VERIFIED PAYMENT
// =====================================================

const verifyAndUpdateBooking = async (booking, reference) => {
  const result = await verifyWithChapa(reference);

  // The API operation may succeed even when the payment did not.
  const payment = result.data || {};

  const verifiedStatus = String(payment.status || "").toUpperCase();
  const expectedAmount = toChapaAmount(booking.totalPrice);
  const receivedAmount = Number(payment.amount);
  const receivedCurrency = String(payment.currency || "").toUpperCase();
  const expectedCurrency = String(
    booking.paymentCurrency || "ETB",
  ).toUpperCase();

  const receivedReference =
    payment.merchant_reference || payment.tx_ref || payment.reference;

  const referenceMatches =
    !receivedReference ||
    receivedReference === booking.paymentReference ||
    receivedReference === booking.processorReference;

  const paymentIsValid =
    verifiedStatus === "SUCCESS" &&
    Number.isFinite(receivedAmount) &&
    receivedAmount === expectedAmount &&
    receivedCurrency === expectedCurrency &&
    referenceMatches;

  if (!paymentIsValid) {
    return {
      success: false,
      paymentStatus: "pending",
      message: "Chapa has not confirmed a matching successful payment.",
    };
  }

  // Do not overwrite an already-paid booking.
  if (booking.paymentStatus !== "paid") {
    booking.paymentStatus = "paid";
    booking.paymentProvider = "chapa";
    booking.paymentMethod = payment.payment_method || payment.method || "Chapa";
    booking.processorReference =
      payment.reference || booking.processorReference;
    booking.paidAt = new Date();

    await booking.save();
  }

  return {
    success: true,
    paymentStatus: "paid",
    message: "Payment successfully verified.",
    bookingId: booking._id,
    amount: booking.totalPrice,
    currency: expectedCurrency,
    paidAt: booking.paidAt,
  };
};

// =====================================================
// 1. INITIALIZE CHAPA HOSTED CHECKOUT
// POST /api/payments/initialize/:bookingId
// =====================================================

exports.initializePayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { bookingId } = req.params;

    if (!process.env.CHAPA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Chapa private key is not configured on the server.",
      });
    }

    if (!FRONTEND_URL || !BACKEND_URL) {
      return res.status(500).json({
        success: false,
        message: "FRONTEND_URL and BACKEND_URL must be configured.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidBookingId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    }).populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled bookings cannot be paid.",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This booking has already been paid.",
      });
    }

    const amountInCents = toChapaAmount(booking.totalPrice);

    if (!Number.isInteger(amountInCents) || amountInCents < 100) {
      return res.status(400).json({
        success: false,
        message: "The payment amount must be at least 1 ETB.",
      });
    }

    if (!booking.user?.email) {
      return res.status(400).json({
        success: false,
        message: "A customer email is required for payment.",
      });
    }

    // Keep the merchant reference within Chapa's 20-character limit.
    // Reuse it for retries of the same pending payment.
    let merchantReference = booking.paymentReference;

    if (
      booking.paymentProvider !== "chapa" ||
      booking.paymentStatus !== "pending" ||
      !merchantReference ||
      !merchantReference.startsWith("STY")
    ) {
      merchantReference = `STY${crypto.randomBytes(8).toString("hex")}`;
    }

    const { first_name, last_name } = getNameParts(booking.user.name);

    const payload = {
      amount: amountInCents,
      currency: booking.paymentCurrency || "ETB",
      merchant_reference: merchantReference,
      customer: {
        first_name,
        last_name,
        email: booking.user.email,
      },
      callback_url: `${BACKEND_URL}/api/payments/callback`,
      return_url:
        `${FRONTEND_URL}/payment/result` +
        `?bookingId=${booking._id}` +
        `&tx_ref=${merchantReference}`,
      meta: {
        booking_id: String(booking._id),
        platform: "Stayora",
      },
      customization: {
        title: "Stayora Hotel Booking",
        description: `Payment for booking ${booking._id}`,
      },
    };

    const response = await fetch(`${CHAPA_BASE_URL}/payments/hosted`, {
      method: "POST",
      headers: getChapaHeaders(merchantReference),
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.status !== "success") {
      console.error("CHAPA INITIALIZATION FAILED:", result);

      return res.status(response.status || 502).json({
        success: false,
        message: result.message || "Chapa could not initialize the payment.",
      });
    }

    const checkoutUrl = result.data?.checkout_url;

    if (!checkoutUrl) {
      return res.status(502).json({
        success: false,
        message: "Chapa did not return a checkout URL.",
      });
    }

    // Save pending payment details before redirecting the customer.
    booking.paymentProvider = "chapa";
    booking.paymentStatus = "pending";
    booking.paymentReference = merchantReference;
    booking.merchantReference = merchantReference;
    booking.checkoutUrl = checkoutUrl;
    booking.paymentMethod = null;
    booking.processorReference =
      checkoutUrl.split("/").filter(Boolean).pop() || null;

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment checkout created successfully.",
      bookingId: booking._id,
      tx_ref: merchantReference,
      checkoutUrl,
      amount: booking.totalPrice,
      currency: booking.paymentCurrency || "ETB",
    });
  } catch (error) {
    console.error("CHAPA INITIALIZATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to initialize payment.",
    });
  }
};

// =====================================================
// 2. VERIFY PAYMENT
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

    if (booking.paymentProvider !== "chapa") {
      return res.status(400).json({
        success: false,
        message: "This is not a Chapa payment.",
      });
    }

    const verification = await verifyAndUpdateBooking(
      booking,
      booking.processorReference || booking.paymentReference,
    );

    return res.status(200).json({
      success: verification.success,
      ...verification,
    });
  } catch (error) {
    console.error("CHAPA VERIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to verify payment.",
    });
  }
};

// =====================================================
// 3. CHAPA CALLBACK
// GET /api/payments/callback
// =====================================================

exports.chapaCallback = async (req, res) => {
  try {
    const reference =
      req.query.merchant_reference || req.query.tx_ref || req.query.reference;

    if (!reference) {
      return res.status(400).send("Payment reference is missing.");
    }

    const booking = await Booking.findOne({
      $or: [{ paymentReference: reference }, { processorReference: reference }],
      paymentProvider: "chapa",
    });

    if (!booking) {
      return res.status(404).send("Payment booking not found.");
    }

    await verifyAndUpdateBooking(
      booking,
      booking.processorReference || booking.paymentReference,
    );

    return res.redirect(
      `${FRONTEND_URL}/payment/result?bookingId=${booking._id}`,
    );
  } catch (error) {
    console.error("CHAPA CALLBACK ERROR:", error);

    return res.redirect(
      `${FRONTEND_URL}/payment/result?status=verification_pending`,
    );
  }
};

// =====================================================
// 4. GET PAYMENT RECEIPT
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

    if (!isValidBookingId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
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

    if (
      booking.paymentProvider !== "chapa" ||
      booking.paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "A receipt is available only after verified payment.",
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
        paymentMethod: booking.paymentMethod,
        paidAt: booking.paidAt,
        issuedAt: new Date(),
        demo: false,
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
