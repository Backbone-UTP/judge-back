const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

const servicePath = path.join(__dirname, '..', 'src', 'modules', 'auth', 'auth.service.js');
const middlewarePath = path.join(__dirname, '..', 'src', 'modules', 'auth', 'auth.middleware.js');

function withModuleMocks(mocks, loader) {
  const originalLoad = Module._load;

  Module._load = function mockedLoad(request, parent, isMain) {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) {
      return mocks[request];
    }

    return originalLoad.apply(this, arguments);
  };

  try {
    return loader();
  } finally {
    Module._load = originalLoad;
  }
}

function loadAuthService({ env, payload, user, token = 'app-access-token' }) {
  delete require.cache[servicePath];

  const calls = {
    verifyIdToken: null,
    upsertGoogleUser: null,
    findUserById: null,
    jwtSign: null,
    jwtVerify: null,
  };

  const googleClient = {
    verifyIdToken: async (options) => {
      calls.verifyIdToken = options;
      return {
        getPayload: () => payload,
      };
    },
  };

  const repository = {
    ensureAuthTables: async () => {},
    upsertGoogleUser: async (input) => {
      calls.upsertGoogleUser = input;
      return user;
    },
    findUserById: async (id) => {
      calls.findUserById = id;
      return user && user.id === id ? user : null;
    },
  };

  const jwt = {
    sign: (payloadToSign, secret, options) => {
      calls.jwtSign = { payload: payloadToSign, secret, options };
      return token;
    },
    verify: (accessToken, secret) => {
      calls.jwtVerify = { accessToken, secret };
      return { sub: user.id, email: user.email };
    },
  };

  const authService = withModuleMocks(
    {
      'google-auth-library': {
        OAuth2Client: function OAuth2Client() {
          return googleClient;
        },
      },
      jsonwebtoken: jwt,
      '../../config/env': env,
      './auth.repository': repository,
    },
    () => require(servicePath),
  );

  return { authService, calls };
}

function loadAuthMiddleware(verifyAppToken) {
  delete require.cache[middlewarePath];

  return withModuleMocks(
    {
      './auth.service': {
        verifyAppToken,
      },
    },
    () => require(middlewarePath),
  );
}

test('loginWithGoogle validates Google token, persists user and signs backend token', async () => {
  const env = {
    auth: {
      googleClientId: 'google-client-id.apps.googleusercontent.com',
      jwtSecret: 'test-jwt-secret',
      jwtExpiresIn: '7d',
    },
  };

  const user = {
    id: 42,
    email: 'student@example.com',
    full_name: 'Student Example',
    avatar_url: 'https://avatar.example.com/photo.png',
    created_at: '2026-06-20T00:00:00.000Z',
    updated_at: '2026-06-20T00:00:00.000Z',
  };

  const payload = {
    sub: 'google-sub-123',
    email: 'student@example.com',
    email_verified: true,
    name: 'Student Example',
    picture: 'https://avatar.example.com/photo.png',
  };

  const { authService, calls } = loadAuthService({ env, payload, user, token: 'backend-access-token' });

  const result = await authService.loginWithGoogle('google-id-token');

  assert.equal(result.accessToken, 'backend-access-token');
  assert.deepEqual(result.user, user);
  assert.deepEqual(calls.verifyIdToken, {
    idToken: 'google-id-token',
    audience: env.auth.googleClientId,
  });
  assert.deepEqual(calls.upsertGoogleUser, {
    googleSub: payload.sub,
    email: payload.email,
    fullName: payload.name,
    avatarUrl: payload.picture,
  });
  assert.deepEqual(calls.jwtSign, {
    payload: {
      sub: user.id,
      email: user.email,
    },
    secret: env.auth.jwtSecret,
    options: {
      expiresIn: env.auth.jwtExpiresIn,
    },
  });

  const me = await authService.getMe(user.id);

  assert.equal(calls.findUserById, user.id);
  assert.deepEqual(me, user);
});

test('loginWithGoogle rejects Google payloads without a verified email', async () => {
  const env = {
    auth: {
      googleClientId: 'google-client-id.apps.googleusercontent.com',
      jwtSecret: 'test-jwt-secret',
      jwtExpiresIn: '7d',
    },
  };

  const payload = {
    sub: 'google-sub-123',
    email: 'student@example.com',
    email_verified: false,
  };

  const { authService, calls } = loadAuthService({
    env,
    payload,
    user: null,
  });

  await assert.rejects(
    () => authService.loginWithGoogle('google-id-token'),
    /Invalid Google account payload/,
  );

  assert.equal(calls.upsertGoogleUser, null);
});

test('authGuard accepts a bearer token and attaches the authenticated user', async () => {
  const { authGuard } = loadAuthMiddleware((accessToken) => {
    assert.equal(accessToken, 'backend-access-token');
    return {
      sub: 42,
      email: 'student@example.com',
    };
  });

  const req = {
    headers: {
      authorization: 'Bearer backend-access-token',
    },
  };

  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  let nextCalled = false;

  authGuard(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    id: 42,
    email: 'student@example.com',
  });
});