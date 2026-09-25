const Room = require("../models/Room");

// =========================================================
// GET ALL ROOMS FOR LOGGED-IN HOTEL ADMIN
// =========================================================

exports.getMyHotelRooms = async (req, res) => {
  try {
    if (!req.hotelId) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const rooms = await Room.find({
      hotel: req.hotelId,
    }).sort({
      roomNumber: 1,
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error("GET HOTEL ROOMS ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to get rooms",
    });
  }
};

// =========================================================
// GET ONE ROOM
// =========================================================

exports.getRoomById = async (req, res) => {
  try {
    if (!req.hotelId) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const room = await Room.findOne({
      _id: req.params.id,
      hotel: req.hotelId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json(room);
  } catch (error) {
    console.error("GET ROOM ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to get room",
    });
  }
};

// =========================================================
// CREATE ROOM
// =========================================================

exports.createRoom = async (req, res) => {
  try {
    if (!req.hotelId) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const {
      roomNumber,
      roomType,
      beds,
      bedType,
      capacity,
      roomSize,
      floor,
      view,
      price,
      status,
      amenities,
      description,
    } = req.body;

    // -------------------------------
    // VALIDATE ROOM NUMBER
    // -------------------------------

    if (!roomNumber) {
      return res.status(400).json({
        message: "Room number is required",
      });
    }

    const cleanRoomNumber = String(roomNumber).trim();

    if (!cleanRoomNumber) {
      return res.status(400).json({
        message: "Room number is required",
      });
    }

    // -------------------------------
    // VALIDATE PRICE
    // -------------------------------

    if (price === undefined || price === null || price === "") {
      return res.status(400).json({
        message: "Room price is required",
      });
    }

    const roomPrice = Number(price);

    if (Number.isNaN(roomPrice) || roomPrice < 0) {
      return res.status(400).json({
        message: "Room price must be a valid number",
      });
    }

    // -------------------------------
    // VALIDATE BEDS
    // -------------------------------

    const roomBeds = Number(beds || 1);

    if (Number.isNaN(roomBeds) || roomBeds < 1) {
      return res.status(400).json({
        message: "Number of beds must be at least 1",
      });
    }

    // -------------------------------
    // VALIDATE CAPACITY
    // -------------------------------

    const roomCapacity = Number(capacity || 2);

    if (Number.isNaN(roomCapacity) || roomCapacity < 1) {
      return res.status(400).json({
        message: "Guest capacity must be at least 1",
      });
    }

    // -------------------------------
    // VALIDATE ROOM SIZE
    // -------------------------------

    const roomSizeValue =
      roomSize === undefined || roomSize === "" ? 0 : Number(roomSize);

    if (Number.isNaN(roomSizeValue) || roomSizeValue < 0) {
      return res.status(400).json({
        message: "Room size must be a valid number",
      });
    }

    // -------------------------------
    // VALIDATE FLOOR
    // -------------------------------

    const floorValue = floor === undefined || floor === "" ? 1 : Number(floor);

    if (Number.isNaN(floorValue) || floorValue < 0) {
      return res.status(400).json({
        message: "Floor must be a valid number",
      });
    }

    // -------------------------------
    // CHECK DUPLICATE ROOM
    // -------------------------------

    const existingRoom = await Room.findOne({
      hotel: req.hotelId,
      roomNumber: cleanRoomNumber,
    });

    if (existingRoom) {
      return res.status(400).json({
        message: "This room number already exists in your hotel",
      });
    }

    // -------------------------------
    // CLEAN AMENITIES
    // -------------------------------

    const cleanAmenities = Array.isArray(amenities)
      ? amenities.filter(
          (amenity) => typeof amenity === "string" && amenity.trim() !== "",
        )
      : [];

    // -------------------------------
    // CREATE ROOM
    // -------------------------------

    const room = await Room.create({
      hotel: req.hotelId,
      roomNumber: cleanRoomNumber,
      roomType: roomType || "Standard",
      beds: roomBeds,
      bedType: bedType || "Single",
      capacity: roomCapacity,
      roomSize: roomSizeValue,
      floor: floorValue,
      view: view || "City View",
      price: roomPrice,
      status: status || "available",
      amenities: cleanAmenities,
      description: description || "",
    });

    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    console.error("CREATE ROOM ERROR:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This room number already exists in your hotel",
      });
    }

    res.status(500).json({
      message: error.message || "Unable to create room",
    });
  }
};

// =========================================================
// UPDATE ROOM
// =========================================================

exports.updateRoom = async (req, res) => {
  try {
    if (!req.hotelId) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const room = await Room.findOne({
      _id: req.params.id,
      hotel: req.hotelId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    const {
      roomNumber,
      roomType,
      beds,
      bedType,
      capacity,
      roomSize,
      floor,
      view,
      price,
      status,
      amenities,
      description,
    } = req.body;

    // -------------------------------
    // UPDATE ROOM NUMBER
    // -------------------------------

    if (roomNumber !== undefined) {
      const cleanRoomNumber = String(roomNumber).trim();

      if (!cleanRoomNumber) {
        return res.status(400).json({
          message: "Room number is required",
        });
      }

      if (cleanRoomNumber !== room.roomNumber) {
        const duplicateRoom = await Room.findOne({
          hotel: req.hotelId,
          roomNumber: cleanRoomNumber,
          _id: {
            $ne: room._id,
          },
        });

        if (duplicateRoom) {
          return res.status(400).json({
            message: "This room number already exists in your hotel",
          });
        }

        room.roomNumber = cleanRoomNumber;
      }
    }

    // -------------------------------
    // UPDATE ROOM TYPE
    // -------------------------------

    if (roomType !== undefined) {
      room.roomType = roomType;
    }

    // -------------------------------
    // UPDATE NUMBER OF BEDS
    // -------------------------------

    if (beds !== undefined) {
      const roomBeds = Number(beds);

      if (Number.isNaN(roomBeds) || roomBeds < 1) {
        return res.status(400).json({
          message: "Number of beds must be at least 1",
        });
      }

      room.beds = roomBeds;
    }

    // -------------------------------
    // UPDATE BED TYPE
    // -------------------------------

    if (bedType !== undefined) {
      room.bedType = bedType;
    }

    // -------------------------------
    // UPDATE GUEST CAPACITY
    // -------------------------------

    if (capacity !== undefined) {
      const roomCapacity = Number(capacity);

      if (Number.isNaN(roomCapacity) || roomCapacity < 1) {
        return res.status(400).json({
          message: "Guest capacity must be at least 1",
        });
      }

      room.capacity = roomCapacity;
    }

    // -------------------------------
    // UPDATE ROOM SIZE
    // -------------------------------

    if (roomSize !== undefined) {
      const roomSizeValue = Number(roomSize);

      if (Number.isNaN(roomSizeValue) || roomSizeValue < 0) {
        return res.status(400).json({
          message: "Room size must be a valid number",
        });
      }

      room.roomSize = roomSizeValue;
    }

    // -------------------------------
    // UPDATE FLOOR
    // -------------------------------

    if (floor !== undefined) {
      const floorValue = Number(floor);

      if (Number.isNaN(floorValue) || floorValue < 0) {
        return res.status(400).json({
          message: "Floor must be a valid number",
        });
      }

      room.floor = floorValue;
    }

    // -------------------------------
    // UPDATE VIEW
    // -------------------------------

    if (view !== undefined) {
      room.view = view;
    }

    // -------------------------------
    // UPDATE PRICE
    // -------------------------------

    if (price !== undefined) {
      const roomPrice = Number(price);

      if (Number.isNaN(roomPrice) || roomPrice < 0) {
        return res.status(400).json({
          message: "Room price must be a valid number",
        });
      }

      room.price = roomPrice;
    }

    // -------------------------------
    // UPDATE STATUS
    // -------------------------------

    if (status !== undefined) {
      room.status = status;
    }

    // -------------------------------
    // UPDATE AMENITIES
    // -------------------------------

    if (amenities !== undefined) {
      room.amenities = Array.isArray(amenities)
        ? amenities.filter(
            (amenity) => typeof amenity === "string" && amenity.trim() !== "",
          )
        : [];
    }

    // -------------------------------
    // UPDATE DESCRIPTION
    // -------------------------------

    if (description !== undefined) {
      room.description = description;
    }

    await room.save();

    res.status(200).json({
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    console.error("UPDATE ROOM ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to update room",
    });
  }
};

// =========================================================
// DELETE ROOM
// =========================================================

exports.deleteRoom = async (req, res) => {
  try {
    if (!req.hotelId) {
      return res.status(404).json({
        message: "No hotel is assigned to this hotel admin",
      });
    }

    const room = await Room.findOne({
      _id: req.params.id,
      hotel: req.hotelId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    await room.deleteOne();

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ROOM ERROR:", error);

    res.status(500).json({
      message: error.message || "Unable to delete room",
    });
  }
};
