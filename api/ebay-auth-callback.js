export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const redirectUri = "https://autoslistcanada.ca/api/ebay-auth-callback";

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange error:", data);
      return res.status(500).json({ error: "Failed to get access token", details: data });
    }

    console.log("✅ Access Token:", data.access_token);

    // TODO: Save token to Airtable, DB, or session
    return res.redirect("/dashboard.html"); // success redirect (you can change this)
  } catch (err) {
    console.error("OAuth Callback Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
