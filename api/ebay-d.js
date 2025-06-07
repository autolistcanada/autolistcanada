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

  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(verificationToken);
  hash.update(endpoint);
  const challengeResponse = hash.digest('hex');

  return res.status(200).json({ challengeResponse });
}
