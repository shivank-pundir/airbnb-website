const mongoose = require("mongoose");
require("dotenv").config();

console.log("🔍 Verifying setup for MongoDB Atlas import...\n");

// Check environment variables
console.log("1. Environment Variables Check:");
if (process.env.ATLASDB_URL) {
  console.log("   ✅ ATLASDB_URL is set");
  // Mask the password in the connection string for security
  const maskedUrl = process.env.ATLASDB_URL.replace(/:([^@]+)@/, ':@');
  console.log(`   📍 Connection string: ${maskedUrl}`);
} else {
  console.log("   ❌ ATLASDB_URL is not set");
  console.log("   💡 Create a .env file with your MongoDB Atlas connection string");
}

if (process.env.SECRET) {
  console.log("   ✅ SECRET is set");
} else {
  console.log("   ⚠  SECRET is not set (will use default)");
}

console.log("\n2. Dependencies Check:");
try {
  const express = require("express");
  console.log("   ✅ Express is available");
} catch (e) {
  console.log("   ❌ Express not found - run 'npm install'");
}

try {
  const mongoose = require("mongoose");
  console.log("   ✅ Mongoose is available");
} catch (e) {
  console.log("   ❌ Mongoose not found - run 'npm install'");
}

try {
  const passport = require("passport");
  console.log("   ✅ Passport is available");
} catch (e) {
  console.log("   ❌ Passport not found - run 'npm install'");
}

console.log("\n3. Model Files Check:");
try {
  const User = require("../models/user.js");
  console.log("   ✅ User model is available");
} catch (e) {
  console.log("   ❌ User model not found:", e.message);
}

try {
  const Listing = require("../models/listing.js");
  console.log("   ✅ Listing model is available");
} catch (e) {
  console.log("   ❌ Listing model not found:", e.message);
}

try {
  const data = require("./data.js");
  console.log(`   ✅ Sample data is available (${data.data.length} listings)`);
} catch (e) {
  console.log("   ❌ Sample data not found:", e.message);
}

console.log("\n4. Connection Test:");
if (process.env.ATLASDB_URL) {
  console.log("   🔌 Testing connection to MongoDB Atlas...");
  
  mongoose.connect(process.env.ATLASDB_URL, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("   ✅ Successfully connected to MongoDB Atlas!");
    console.log("   📊 Database:", mongoose.connection.db.databaseName);
    console.log("   🌐 Host:", mongoose.connection.host);
    console.log("   🔌 Port:", mongoose.connection.port);
  })
  .catch((err) => {
    console.log("   ❌ Connection failed:", err.message);
    if (err.message.includes("ENOTFOUND")) {
      console.log("      💡 Check your internet connection and cluster URL");
    } else if (err.message.includes("Authentication failed")) {
      console.log("      💡 Check your username and password");
    } else if (err.message.includes("ECONNREFUSED")) {
      console.log("      💡 Check if your IP is whitelisted in MongoDB Atlas");
    }
  })
  .finally(() => {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
      console.log("   🔌 Test connection closed");
    }
  });
} else {
  console.log("   ⚠  Skipping connection test - ATLASDB_URL not set");
}

console.log("\n" + "=".repeat(50));
console.log("📋 SUMMARY:");
console.log("=".repeat(50));

if (process.env.ATLASDB_URL) {
  console.log("✅ Ready to import data to MongoDB Atlas!");
  console.log("🚀 Run: npm run import-data");
} else {
  console.log("❌ Setup incomplete. Please:");
  console.log("   1. Create a .env file with your ATLASDB_URL");
  console.log("   2. Run 'npm install' if dependencies are missing");
  console.log("   3. Verify your MongoDB Atlas cluster is accessible");
}

console.log("=".repeat(50));