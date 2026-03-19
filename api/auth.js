module.exports = async function handler(req, res) {
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

  const data = await tokenRes.json();

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html><html><body><script>
    var token = ${JSON.stringify(data.access_token)};
    var error = ${JSON.stringify(data.error)};
    var msg = error
      ? 'authorization:github:error:' + JSON.stringify({error: error})
      : 'authorization:github:success:' + JSON.stringify({token: token, provider: 'github'});
    window.opener.postMessage(msg, '*');
    window.close();
  </script></body></html>`);
}
