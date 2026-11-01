const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

// =====================================================
// PROTECT ROUTES
// =====================================================

const protect = async (req, res, next) => {
  try {
    console.log("\n=================================");
    console.log("PROTECT MIDDLEWARE");
    console.log("METHOD:", req.method);
    console.log("URL:", req.originalUrl);

    // 1. CHECK JWT SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    // 2. CHECK AUTHORIZATION HEADER
    const authHeader = req.headers.authorization || "";

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // 3. EXTRACT TOKEN
    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    console.log("Token received:", token.length, "characters");

    // 4. VERIFY TOKEN
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("JWT VERIFIED SUCCESSFULLY");
      console.log("Token user ID:", decoded.id);
      console.log("Token email:", decoded.email);
    } catch (jwtError) {
      console.error("JWT VERIFY ERROR:", jwtError.name, jwtError.message);

      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired. Please log in again.",
        });
      }

      if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          message: "Invalid token. Please log in again.",
        });
      }

      return res.status(401).json({
        message: "Token verification failed",
      });
    }

    // 5. CHECK DATABASE CONNECTION
    console.log("MongoDB readyState:", mongoose.connection.readyState);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is not connected",
      });
    }

    // 6. FIND USER
    let user = null;

    if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(decoded.id).select("-password");
    }

    // FALLBACK TO EMAIL
    if (!user && decoded.email) {
      user = await User.findOne({
        email: String(decoded.email).toLowerCase().trim(),
      }).select("-password");
    }

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // 7. CHECK ACCOUNT STATUS
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been deactivated",
      });
    }

    // 8. SET AUTHENTICATED USER
    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("AUTHENTICATED USER:", {
      id: String(user._id),
      email: user.email,
      role: user.role,
    });

    console.log("PROTECT MIDDLEWARE SUCCESS");
    console.log("=================================\n");

    next();
  } catch (error) {
    console.error("PROTECT MIDDLEWARE ERROR:", error);

    return res.status(500).json({
      message: "Authentication middleware error",
    });
  }
};

// =====================================================
// ADMIN ONLY
// =====================================================

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const role = String(req.user.role || "")
    .trim()
    .toLowerCase();

  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }

  next();
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  protect,
  adminOnly,
};
