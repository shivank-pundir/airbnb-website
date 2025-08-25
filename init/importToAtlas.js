const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require("dotenv").config({path:'../.env'});

const MONGO_URL = process.env.ATLASDB_URL;

if (!MONGO_URL) {
  console.error("❌ Error: ATLASDB_URL environment variable is not set!");
  console.log("Please create a .env file with your MongoDB Atlas connection string:");
  console.log("ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/database");
  process.exit(1);
}

async function main() {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    console.log("📍 Connection string:", MONGO_URL.replace(/:([^@]+)@/, ":@"));

    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    console.log("✅ Connected to MongoDB Atlas successfully!");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🌐 Host:", mongoose.connection.host);

    // Run the import
    await importData();
  } catch (err) {
    console.error("❌ Error:", err.message);

    if (err.message.includes("ENOTFOUND")) {
      console.log("💡 Tip: Check your internet connection and MongoDB Atlas cluster status");
    } else if (err.message.includes("Authentication failed")) {
      console.log("💡 Tip: Check your username and password in the connection string");
    } else if (err.message.includes("ECONNREFUSED")) {
      console.log("💡 Tip: Check if your IP address is whitelisted in MongoDB Atlas");
    } else if (err.message.includes("Server selection timeout")) {
      console.log("💡 Tip: Check if your MongoDB Atlas cluster is running and accessible");
    } else if (err.message.includes("Sample data not properly loaded")) {
      console.log("💡 Tip: Check the init/data.js file for syntax errors");
    }

    console.log("\n🔍 Full error details:", err);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("🔌 Database connection closed");
    }
  }
}

const importData = async () => {
  try {
    // Verify data is loaded
    if (!initData || !initData.data || !Array.isArray(initData.data)) {
      throw new Error("Sample data not properly loaded. Check init/data.js file.");
    }

    console.log(`📊 Sample data loaded: ${initData.data.length} listings found`);

    // Verify first listing structure
    if (initData.data.length > 0) {
      const firstListing = initData.data[0];
      console.log("📋 Sample listing structure:");
      console.log(`   Title: ${firstListing.title}`);
      console.log(`   Price: $${firstListing.price}`);
      console.log(`   Location: ${firstListing.location}, ${firstListing.country}`);
      console.log(`   Image URL: ${firstListing.image?.url ? "✅ Present" : "❌ Missing"}`);
    }

    console.log("🗑  Clearing existing data...");

    let deletedListings, deletedUsers;
    try {
      deletedListings = await Listing.deleteMany({});
      deletedUsers = await User.deleteMany({});
      console.log("✅ Data clearing completed");
    } catch (clearError) {
      console.log("⚠  Warning: Could not clear existing data:", clearError.message);
      deletedListings = { deletedCount: 0 };
      deletedUsers = { deletedCount: 0 };
    }

    const listingsCount = deletedListings.deletedCount || 0;
    const usersCount = deletedUsers.deletedCount || 0;

    console.log(`✅ Deleted ${listingsCount} existing listings`);
    console.log(`✅ Deleted ${usersCount} existing users`);

    console.log("👤 Creating test user...");

    // Create a test user
    const testUser = new User({
      email: "test@example.com",
      username: "testuser",
    });

    console.log("   📝 User object created, setting password...");

    try {
      await testUser.setPassword("test123"); // works only with passport-local-mongoose
      console.log("   🔐 Password set successfully");
    } catch (passwordError) {
      console.error("   ❌ Error setting password:", passwordError.message);
      throw passwordError;
    }

    try {
      await testUser.save();
      console.log("   💾 User saved to database");
    } catch (saveError) {
      console.error("   ❌ Error saving user:", saveError.message);
      throw saveError;
    }

    console.log("✅ Test user created successfully!");
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Username: ${testUser.username}`);

    console.log("🏠 Creating sample listings...");

    const listingsWithOwner = initData.data.map((listing) => ({
      ...listing,
      owner: testUser._id,
    }));

    console.log(`   📋 Prepared ${listingsWithOwner.length} listings for import`);

    let createdListings;
    try {
      createdListings = await Listing.insertMany(listingsWithOwner);
      console.log(`✅ Inserted ${createdListings.length} listings`);
    } catch (insertError) {
      console.error("   ❌ Error inserting listings:", insertError.message);
      if (insertError.code === 11000) {
        console.log("   💡 Duplicate key error. Check your data for unique constraints.");
      }
      throw insertError;
    }

    console.log("\n🎉 Database import completed successfully!");
    console.log("=".repeat(50));
    console.log("📧 Test user credentials:");
    console.log("   Email: test@example.com");
    console.log("   Password: test123");
    console.log("=".repeat(50));
    console.log("🏠 Total listings imported:", createdListings.length);
    console.log("👤 Test user created with ID:", testUser._id);

    console.log("\n📋 Sample listings imported:");
    createdListings.slice(0, 5).forEach((listing, index) => {
      console.log(`   ${index + 1}. ${listing.title} - $${listing.price}/night`);
    });
    if (createdListings.length > 5) {
      console.log(`   ... and ${createdListings.length - 5} more listings`);
    }
  } catch (error) {
    console.error("❌ Error importing data:", error.message);
    if (error.code === 11000) {
      console.log("💡 Tip: This might be a duplicate key error. Check your data for unique constraints.");
    }
    throw error;
  }
};

// Run the import
main()
  .then(() => {
    console.log("\n✨ Import script completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n💥 Import failed:", err.message);
    process.exit(1);
  });
