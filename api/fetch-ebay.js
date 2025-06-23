// /api/fetch-ebay.js

export default async function handler(req, res) {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    // Step 1: Get OAuth2 token
    const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
  scope: "https://api.ebay.com/oauth/api_scope",
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Step 2: Get inventory items (limited to 10 for now)
    const listingsRes = await fetch("https://api.ebay.com/sell/inventory/v1/inventory_item?limit=10", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const listings = await listingsRes.json();
    res.status(200).json({ listings });

  } catch (err) {
    console.error("eBay API error:", err);
    res.status(500).json({ error: "Failed to fetch eBay listings." });
  }
}
