const User = require("../models/User");

// ===============================
// GET ALL USERS - ADMIN ONLY
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -token")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);

    res.status(500).json({
      message: "Failed to load users",
      error: error.message,
    });
  }
};

// ===============================
// DELETE USER - ADMIN ONLY
// ===============================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Don't allow admin to delete himself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};