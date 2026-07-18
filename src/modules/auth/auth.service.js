const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const authRepository = require('./auth.repository');

const googleClient = new OAuth2Client(env.auth.googleClientId);

async function loginWithGoogle(idToken) {
  if (!env.auth.googleClientId) {
    throw new Error('Missing GOOGLE_CLIENT_ID in environment variables');
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.auth.googleClientId,
    });
  } catch (_error) {
    throw new Error('Invalid Google token');
  }

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
    throw new Error('Invalid Google account payload');
  }

  const user = await authRepository.upsertGoogleUser({
    googleSub: payload.sub,
    email: payload.email,
    fullName: payload.name || null,
    avatarUrl: payload.picture || null,
  });

  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.auth.jwtSecret,
    { expiresIn: env.auth.jwtExpiresIn },
  );

  return {
    accessToken,
    user,
  };
}

function verifyAppToken(accessToken) {
  return jwt.verify(accessToken, env.auth.jwtSecret);
}

async function getMe(userId) {
  return authRepository.findUserById(userId);
}

module.exports = {
  loginWithGoogle,
  verifyAppToken,
  getMe,
};
