export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID,
      scope: 'repo,user',
    });
    return res.redirect(
      `https://github.com/login/oauth/authorize?${params}`
    );
  }

  const tokenRes = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        code,
      }),
    }
  );

  const { access_token, error } = await tokenRes.json();

  if (error || !access_token) {
    return res.send(`
      <script>
        window.opener.postMessage(
          'authorization:github:error:${JSON.stringify({ error: error || 'No token received' })}',
          '*'
        );
        window.close();
      </script>
    `);
  }

  res.send(`
