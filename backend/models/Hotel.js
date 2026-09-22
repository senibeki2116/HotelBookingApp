const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    rooms: {
      type: Number,
      required: true,
    },

    // The user who created the hotel
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // The hotel administrator responsible for this hotel
    hotelAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Hotel", hotelSchema);
