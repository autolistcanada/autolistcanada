export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { challengeCode, verificationToken, endpoint } = req.body;

  const expectedToken = "AutoListCanadaSecureWebhookToken2025_launch";
  if (verificationToken !== expectedToken) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  // Forward to your live Webhook.site inbox
  const response = await fetch("https://webhook.site/dc1cbf55-8797-4657-a8ce-fcfe84c80e66", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeCode, verificationToken, endpoint })
  });

  return res.status(200).json({ message: 'Forwarded to webhook.site successfully' });
}
