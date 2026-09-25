const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    roomType: {
      type: String,
      enum: ["Standard", "Deluxe", "Suite", "Family"],
      default: "Standard",
    },

    // Number of beds in the room
    beds: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // Type of bed
    bedType: {
      type: String,
      enum: ["Single", "Double", "Queen", "King"],
      default: "Single",
    },

    // Maximum number of guests
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },

    // Room size in square meters
    roomSize: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Floor number
    floor: {
      type: Number,
      min: 0,
      default: 1,
    },

    // Room view
    view: {
      type: String,
      enum: [
        "City View",
        "Garden View",
        "Pool View",
        "Mountain View",
        "No View",
      ],
      default: "City View",
    },

    // Room price per night
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Room status
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "maintenance"],
      default: "available",
    },

    // Room amenities
    amenities: {
      type: [String],
      default: [],
    },

    // Room description
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.index(
  {
    hotel: 1,
    roomNumber: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Room", roomSchema);
