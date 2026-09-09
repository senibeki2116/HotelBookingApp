const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Database:", mongoose.connection.name);

  const users = await User.find({}, "_id email role");

  console.log(users);

  process.exit();
}

run().catch(console.error);
