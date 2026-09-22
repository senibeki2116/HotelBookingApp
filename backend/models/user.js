const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    token: {
      type: String,
      default: null,
    },

    // User roles:
    // user       = normal customer
    // admin      = super admin
    // hoteladmin = administrator for one specific hotel
    role: {
      type: String,
      enum: ["user", "admin", "hoteladmin"],
      default: "user",
    },

    // Used to activate/deactivate an account
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent Mongoose OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
