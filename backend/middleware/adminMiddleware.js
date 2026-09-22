
const admin = (req, res, next) => {
  console.log("Admin user:", req.user);

  // Only the main admin (Super Admin) can access
  // routes protected by this middleware.
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Super Admin access denied",
    });
  }
};

module.exports = admin;

