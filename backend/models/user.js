
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    token: {
      type: String,
    },

    // User roles:
    // user      = normal customer
    // admin     = super admin
    // hoteladmin = administrator for one specific hotel
    role: {
      type: String,
      enum: ["user", "admin", "hoteladmin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

