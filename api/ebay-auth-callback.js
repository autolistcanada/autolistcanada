export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code from eBay OAuth' });
  }

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
redirect_uri: 'https://autoslistcanada.ca/api/ebay-auth-callback'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ eBay Access Token:', data.access_token);
      return res.status(200).json({ success: true, token: data.access_token });
    } else {
      return res.status(500).json({ error: data });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
