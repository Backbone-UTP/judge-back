const { Router } = require('express');
const env = require('../../config/env');
const authService = require('./auth.service');
const { authGuard } = require('./auth.middleware');
const { renderGoogleIdTokenPlayground } = require('./utils/google-playground');

const router = Router();

router.get('/google/playground', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(renderGoogleIdTokenPlayground(env.auth.googleClientId));
});

router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required' });
    }

    const result = await authService.loginWithGoogle(idToken);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authGuard, async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
