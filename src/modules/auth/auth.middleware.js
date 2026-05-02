const authService = require('./auth.service');

function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = authService.verifyAppToken(accessToken);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = {
  authGuard,
};
