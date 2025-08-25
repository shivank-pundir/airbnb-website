const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require("dotenv").config();


const MONGO_URL = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    // Clear existing data
    await Listing.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    const testUser = new User({
      email: "test@example.com",
      username: "testuser"
    });
    
    // Set a simple password
    await testUser.setPassword("test123");
    await testUser.save();
    
    console.log("✅ Test user created:", testUser._id);

    // Create listings with the test user as owner
    const listingsWithOwner = initData.data.map((listing) => ({
      ...listing,
      owner: testUser._id,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("✅ Sample listings created with owner");

    console.log("🎉 Database initialized successfully!");
    console.log("📧 Test user email: test@example.com");
    console.log("🔑 Test user password: test123");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

initDB();
