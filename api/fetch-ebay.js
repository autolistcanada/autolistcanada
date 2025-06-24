// /api/fetch-ebay.js

export default async function handler(req, res) {
  // 🔐 Pull the token from global memory (temporary solution for now)
  const accessToken = global.latestEbayAccessToken;

  // 🚨 If user hasn't authenticated yet
  if (!accessToken) {
    return res.status(401).json({
      error: "No access token found. Please authenticate with eBay first.",
    });
  }

  try {
    // 📦 Step 1: Fetch live eBay inventory (10 items for now)
    const listingsRes = await fetch(
      "https://api.ebay.com/sell/inventory/v1/inventory_item?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const listings = await listingsRes.json();

    // ✅ Return listings as JSON
    return res.status(200).json({ listings });
  } catch (err) {
    console.error("❌ eBay API Error:", err);
    return res.status(500).json({ error: "Failed to fetch eBay listings." });
  }
}
