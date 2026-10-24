const authService = require('./auth.service');
const env = require('../../config/env');

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

function judgeGuard(req, res, next) {
  const judgeSecret = env.judge?.secret || process.env.JUDGE_SECRET || 'judge-internal-secret';
  const judgeTokenHeader = req.headers['x-judge-token'];
  const authHeader = req.headers.authorization;

  if (judgeTokenHeader && judgeTokenHeader === judgeSecret) {
    req.isJudge = true;
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();

    if (token === judgeSecret) {
      req.isJudge = true;
      return next();
    }

    try {
      const decoded = authService.verifyAppToken(token);
      if (decoded && decoded.role === 'judge') {
        req.user = decoded;
        req.isJudge = true;
        return next();
      }
      return res.status(403).json({ message: 'Forbidden: judge access required' });
    } catch (_error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  return res.status(401).json({ message: 'Missing judge authentication credential' });
}

module.exports = {
  authGuard,
  judgeGuard,
};
