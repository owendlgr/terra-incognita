export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    const params = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID,
      scope: 'repo,user',
      redirect_uri: `https://terra-incognita-sigma.vercel.app/api/auth`
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params}`);
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: `https://terra-incognita-sigma.vercel.app/api/auth`
    })
  });

  const data = await response.json();
  
  const script = `
    <script>
      const token = ${JSON.stringify(data.access_token)};
      const provider = 'github';
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token: data.access_token, provider: "github" })}',
        '*'
      );
    </script>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html><html><body>${script}</body></html>`);
}
