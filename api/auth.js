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
  const token = data.access_token;
  const error = data.error;

  if (error || !token) {
    return res.send(`<!DOCTYPE html><html><body><script>
      (function() {
        function receiveMessage(e) {
          console.log('receiveMessage %o', e);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage(
          'authorization:github:error:' + JSON.stringify({error: '${error || 'No token'}'}),
          '*'
        );
      })()
    </script></body></html>`);
  }

  return res.send(`<!DOCTYPE html><html><body><script>
    (function() {
      function receiveMessage(e) {
        console.log('receiveMessage %o', e);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage(
        'authorization:github:success:' + JSON.stringify({token: '${token}', provider: 'github'}),
        '*'
      );
    })()
  </script></body></html>`);
}
