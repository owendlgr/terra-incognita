module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const API_KEY   = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE  = process.env.MAILCHIMP_AUDIENCE_ID;
  const DC        = 'us10';

  try {
    const response = await fetch(
      `https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: name || ''
          }
        })
      }
    );

    const data = await response.json();

    if (response.status === 200 || response.status === 201) {
      return res.status(200).json({ success: true });
    }

    // Already subscribed
    if (data.title === 'Member Exists') {
      return res.status(200).json({ success: true, existing: true });
    }

    return res.status(400).json({ error: data.detail || 'Subscription failed' });

  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
