console.log("🧪 Testing data file loading...\n");

try {
  const initData = require("./data.js");
  console.log("✅ Data file loaded successfully");

  if (initData && initData.data) {
    console.log(`📊 Found ${initData.data.length} listings`);

    if (initData.data.length > 0) {
      const firstListing = initData.data[0];
      console.log("\n📋 First listing details:");
      console.log(`   Title: ${firstListing.title}`);
      console.log(`   Description: ${firstListing.description?.substring(0, 50)}...`);
      console.log(`   Price: $${firstListing.price}`);
      console.log(`   Location: ${firstListing.location}, ${firstListing.country}`);
      console.log(`   Place: ${firstListing.place || "Not specified"}`);
      console.log(`   Image URL: ${firstListing.image?.url ? "✅ Present" : "❌ Missing"}`);
      console.log(`   Image Filename: ${firstListing.image?.filename || "Not specified"}`);
    }

    // Check for any missing required fields
    const requiredFields = ["title", "description", "image", "price", "location", "country"];
    const missingFields = [];

    initData.data.forEach((listing, index) => {
      requiredFields.forEach((field) => {
        if (!listing[field]) {
          missingFields.push(`Listing ${index + 1} (${listing.title}): missing ${field}`);
        }
      });

      if (listing.image && (!listing.image.url || !listing.image.filename)) {
        missingFields.push(`Listing ${index + 1} (${listing.title}): incomplete image data`);
      }
    });

    if (missingFields.length > 0) {
      console.log("\n⚠ Missing or incomplete data found:");
      missingFields.forEach((field) => console.log(`   ${field}`));
    } else {
      console.log("\n✅ All listings have complete data");
    }

  } else {
    console.log("❌ Data structure is invalid");
    console.log("Expected: { data: [...] }");
    console.log("Got:", initData);
  }

} catch (error) {
  console.error("❌ Error loading data file:", error.message);
  console.log("\n🔍 This could be due to:");
  console.log("   1. Syntax error in data.js file");
  console.log("   2. Missing or corrupted data.js file");
  console.log("   3. Node.js module loading issue");
}

console.log("\n✨ Data file test completed!");
