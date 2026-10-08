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

    // -------------------------------------------------
    // CHECK AUTHORIZATION HEADER
    // -------------------------------------------------

    const authHeader = req.headers.authorization || "";

    console.log("Authorization header:", authHeader ? "Present" : "Missing");

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

    // -------------------------------------------------
    // GET TOKEN
    // -------------------------------------------------

    const token = authHeader.substring(7).trim();

    console.log(
      "Token received:",
      token ? `YES (${token.length} characters)` : "NO",
    );

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // -------------------------------------------------
    // VERIFY TOKEN
    // -------------------------------------------------

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("✅ JWT verified");
      console.log("JWT decoded:", decoded);
    } catch (jwtError) {
      console.error("❌ JWT VERIFY ERROR:", jwtError.message);

      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // -------------------------------------------------
    // DATABASE INFORMATION
    // -------------------------------------------------

    console.log("\n=================================");
    console.log("DATABASE USER LOOKUP");

    console.log("MongoDB readyState:", mongoose.connection.readyState);

    console.log("MongoDB database:", User.db?.name || "UNKNOWN");

    console.log("MongoDB host:", User.db?.host || "UNKNOWN");

    console.log("User collection:", User.collection?.name || "UNKNOWN");

    console.log("Token user ID:", decoded.id);
    console.log("Token email:", decoded.email);

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    let user = null;

    // First try using the ObjectId directly.
    if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      try {
        const objectId = new mongoose.Types.ObjectId(decoded.id);

        user = await User.findOne({
          _id: objectId,
        }).select("-password");

        console.log("FIND USER BY OBJECT ID:", user ? "FOUND" : "NOT FOUND");
      } catch (idError) {
        console.error("❌ OBJECT ID LOOKUP ERROR:", idError.message);
      }
    } else {
      console.log("⚠️ Token ID is not a valid MongoDB ObjectId");
    }

    // -------------------------------------------------
    // FALLBACK TO EMAIL
    // -------------------------------------------------

    if (!user && decoded.email) {
      console.log("Trying user lookup by verified JWT email...");

      try {
        user = await User.findOne({
          email: String(decoded.email).toLowerCase().trim(),
        }).select("-password");

        console.log("FIND USER BY EMAIL:", user ? "FOUND" : "NOT FOUND");
      } catch (emailError) {
        console.error("❌ EMAIL LOOKUP ERROR:", emailError.message);
      }
    }

    // -------------------------------------------------
    // USER NOT FOUND
    // -------------------------------------------------

    if (!user) {
      console.log("❌ USER NOT FOUND");

      return res.status(401).json({
        message: "User not found",
      });
    }

    // -------------------------------------------------
    // VERIFY IDENTITY
    // -------------------------------------------------

    console.log("✅ USER FOUND");
    console.log("Database User ID:", user._id);
    console.log("Database User Name:", user.name);
    console.log("Database User Email:", user.email);
    console.log("Database User Role:", user.role);
    console.log("Database User Active:", user.isActive);

    // -------------------------------------------------
    // CHECK ACTIVE ACCOUNT
    // -------------------------------------------------

    if (user.isActive === false) {
      console.log("❌ USER ACCOUNT DEACTIVATED");

      return res.status(401).json({
        message: "Your account has been deactivated",
      });
    }

    // -------------------------------------------------
    // SET AUTHENTICATED USER
    // -------------------------------------------------

    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("✅ AUTHENTICATED USER:", req.user);
    console.log("=================================\n");

    next();
  } catch (error) {
    console.error("\n=================================");
    console.error("❌ PROTECT MIDDLEWARE ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN ONLY
// =====================================================

const adminOnly = (req, res, next) => {
  const role = String(req.user?.role || "")
    .trim()
    .toLowerCase();

  console.log("\n=================================");
  console.log("ADMIN ROLE CHECK");
  console.log("ROLE:", role);

  if (!req.user) {
    console.log("❌ No authenticated user");

    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (role !== "admin" && role !== "superadmin") {
    console.log("❌ Admin access denied");
    console.log("Required role: admin or superadmin");
    console.log("Received role:", role);

    return res.status(403).json({
      message: "Admin access only",
    });
  }

  console.log("✅ Admin access granted");
  console.log("=================================\n");

  next();
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  protect,
  adminOnly,
};
