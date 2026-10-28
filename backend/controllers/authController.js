const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/user");
const Hotel = require("../models/Hotel");

// =====================================================
// CREATE JWT TOKEN
// =====================================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================================
// CHECK PASSWORD
// Supports bcrypt hashes and legacy plain-text passwords
// =====================================================

const checkPassword = async (enteredPassword, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  const isBcryptPassword =
    storedPassword.startsWith("$2a$") ||
    storedPassword.startsWith("$2b$") ||
    storedPassword.startsWith("$2y$");

  if (isBcryptPassword) {
    return bcrypt.compare(enteredPassword, storedPassword);
  }

  return enteredPassword === storedPassword;
};

// =====================================================
// REGISTER NORMAL USER
// =====================================================

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!cleanName) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      isActive: true,
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        message: "Your account has been deactivated",
      });
    }

    const passwordCorrect = await checkPassword(
      String(password),
      user.password,
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Migrate legacy plain-text passwords to bcrypt.
    const isAlreadyHashed =
      user.password &&
      (user.password.startsWith("$2a$") ||
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2y$"));

    if (!isAlreadyHashed) {
      user.password = await bcrypt.hash(String(password), 10);
      await user.save();
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Login failed",
    });
  }
};

// =====================================================
// CREATE HOTEL ADMIN
// Optionally assigns a hotel using hotelId
// =====================================================

exports.createHotelAdmin = async (req, res) => {
  let createdAdminId = null;

  try {
    const { name, email, password, hotelId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists",
      });
    }

    let selectedHotel = null;

    if (hotelId !== undefined && hotelId !== null && hotelId !== "") {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(400).json({
          message: "Invalid hotel ID",
        });
      }

      selectedHotel = await Hotel.findById(hotelId);

      if (!selectedHotel) {
        return res.status(404).json({
          message: "Selected hotel not found",
        });
      }

      if (selectedHotel.hotelAdmin) {
        return res.status(409).json({
          message: "This hotel already has an assigned hotel admin",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const hotelAdmin = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "hoteladmin",
      isActive: true,
    });

    createdAdminId = hotelAdmin._id;

    if (selectedHotel) {
      selectedHotel.hotelAdmin = hotelAdmin._id;
      await selectedHotel.save();
    }

    const assignedHotel = selectedHotel
      ? {
          _id: selectedHotel._id,
          name: selectedHotel.name,
          location: selectedHotel.location,
        }
      : null;

    return res.status(201).json({
      message: "Hotel admin created successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
        isActive: hotelAdmin.isActive,
        assignedHotel,
        hotelId: selectedHotel?._id || null,
      },
    });
  } catch (error) {
    // Avoid leaving a newly created account behind if assignment fails.
    if (createdAdminId) {
      try {
        await Hotel.updateMany(
          { hotelAdmin: createdAdminId },
          { $set: { hotelAdmin: null } },
        );
        await User.deleteOne({ _id: createdAdminId });
      } catch (cleanupError) {
        console.error("CREATE ADMIN CLEANUP ERROR:", cleanupError);
      }
    }

    console.error("CREATE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to create hotel admin",
    });
  }
};

// =====================================================
// GET ALL HOTEL ADMINS
// Includes each admin's assigned hotel
// =====================================================

exports.getHotelAdmins = async (req, res) => {
  try {
    const hotelAdmins = await User.find({
      role: "hoteladmin",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const adminIds = hotelAdmins.map((admin) => admin._id);

    const hotels = await Hotel.find({
      hotelAdmin: { $in: adminIds },
    })
      .select("name location hotelAdmin")
      .lean();

    const hotelByAdminId = new Map();

    for (const hotel of hotels) {
      if (hotel.hotelAdmin) {
        hotelByAdminId.set(String(hotel.hotelAdmin), {
          _id: hotel._id,
          name: hotel.name,
          location: hotel.location,
        });
      }
    }

    const result = hotelAdmins.map((admin) => {
      const assignedHotel = hotelByAdminId.get(String(admin._id)) || null;

      return {
        ...admin,
        assignedHotel,
        hotelId: assignedHotel?._id || null,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("GET HOTEL ADMINS ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to get hotel admins",
    });
  }
};

// =====================================================
// UPDATE HOTEL ADMIN
// Can assign, change, or remove a hotel assignment
// =====================================================

exports.updateHotelAdmin = async (req, res) => {
  try {
    const { name, email, password, isActive, hotelId } = req.body;

    const hotelAdmin = await User.findOne({
      _id: req.params.id,
      role: "hoteladmin",
    });

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    // Validate the requested assignment before changing anything.
    let selectedHotel = null;
    const assignmentIncluded = Object.prototype.hasOwnProperty.call(
      req.body,
      "hotelId",
    );

    if (assignmentIncluded && hotelId !== null && hotelId !== "") {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        return res.status(400).json({
          message: "Invalid hotel ID",
        });
      }

      selectedHotel = await Hotel.findById(hotelId);

      if (!selectedHotel) {
        return res.status(404).json({
          message: "Selected hotel not found",
        });
      }

      if (
        selectedHotel.hotelAdmin &&
        String(selectedHotel.hotelAdmin) !== String(hotelAdmin._id)
      ) {
        return res.status(409).json({
          message: "This hotel is already assigned to another admin",
        });
      }
    }

    // Update name.
    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      hotelAdmin.name = cleanName;
    }

    // Update email.
    if (email !== undefined) {
      const cleanEmail = String(email).toLowerCase().trim();

      if (!cleanEmail) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      const existingUser = await User.findOne({
        email: cleanEmail,
        _id: { $ne: hotelAdmin._id },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Another user already uses this email",
        });
      }

      hotelAdmin.email = cleanEmail;
    }

    // Update password.
    if (password !== undefined && password !== "") {
      if (String(password).length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      hotelAdmin.password = await bcrypt.hash(String(password), 10);
    }

    // Update active status.
    if (isActive !== undefined) {
      hotelAdmin.isActive = isActive === true || isActive === "true";
    }

    await hotelAdmin.save();

    // Change the assignment only if hotelId was included.
    if (assignmentIncluded) {
      await Hotel.updateMany(
        { hotelAdmin: hotelAdmin._id },
        { $set: { hotelAdmin: null } },
      );

      if (selectedHotel) {
        selectedHotel.hotelAdmin = hotelAdmin._id;
        await selectedHotel.save();
      }
    } else {
      selectedHotel = await Hotel.findOne({
        hotelAdmin: hotelAdmin._id,
      }).select("name location");
    }

    const assignedHotel = selectedHotel
      ? {
          _id: selectedHotel._id,
          name: selectedHotel.name,
          location: selectedHotel.location,
        }
      : null;

    return res.status(200).json({
      message: "Hotel admin updated successfully",
      user: {
        id: hotelAdmin._id,
        _id: hotelAdmin._id,
        name: hotelAdmin.name,
        email: hotelAdmin.email,
        role: hotelAdmin.role,
        isActive: hotelAdmin.isActive,
        assignedHotel,
        hotelId: selectedHotel?._id || null,
      },
    });
  } catch (error) {
    console.error("UPDATE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to update hotel admin",
    });
  }
};

// =====================================================
// DELETE HOTEL ADMIN
// Clears hotel assignments before deleting the account
// =====================================================

exports.deleteHotelAdmin = async (req, res) => {
  try {
    const hotelAdmin = await User.findOne({
      _id: req.params.id,
      role: "hoteladmin",
    });

    if (!hotelAdmin) {
      return res.status(404).json({
        message: "Hotel admin not found",
      });
    }

    await Hotel.updateMany(
      { hotelAdmin: hotelAdmin._id },
      { $set: { hotelAdmin: null } },
    );

    await hotelAdmin.deleteOne();

    return res.status(200).json({
      message: "Hotel admin deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ADMIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Unable to delete hotel admin",
    });
  }
};
