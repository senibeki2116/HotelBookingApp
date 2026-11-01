const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    rooms: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Booking status
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    // Payment information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    paymentProvider: {
      type: String,
      enum: ["chapa", "other"],
      default: "chapa",
    },

    paymentReference: {
      type: String,
      default: null,
    },

    merchantReference: {
      type: String,
      default: null,
    },

    checkoutUrl: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      default: null,
    },

    processorReference: {
      type: String,
      default: null,
    },

    paymentCurrency: {
      type: String,
      default: "ETB",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
