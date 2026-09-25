const admin = (req, res, next) => {
  console.log("========== ADMIN CHECK ==========");
  console.log("User:", req.user);
  console.log("Role:", req.user?.role);
  console.log("=================================");

  const role = String(req.user?.role || req.user?.userRole || "")
    .trim()
    .toLowerCase();

  if (role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
      currentRole: role || "no role",
    });
  }

  next();
};

module.exports = admin;
