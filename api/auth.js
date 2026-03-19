const { Authenticator } = require('netlify-auth-providers');

const config = {
  origin: process.env.VERCEL_URL,
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
};

module.exports = (req, res) => {
  const auth = new Authenticator(config);
  auth.authenticate({ provider: 'github', scope: 'repo,user' }, (err, data) => {
    if (err) {
      res.status(401).json({ error: err });
      return;
    }
    res.status(200).json(data);
  });
};
