// named imports fail — package spreads requiresAuth into module.exports
import pkg from 'express-openid-connect';
const { auth, requiresAuth } = pkg;

// skip Auth0 in tests — x-test-user header acts as the logged-in user
const testMode = process.env.AUTH_DISABLED === 'true';

export function authMiddleware() {
  if (testMode) {
    return (req, _res, next) => {
      const sub = req.header('x-test-user');
      // fake the req.oidc that express-openid-connect normally adds
      req.oidc = sub
        ? { isAuthenticated: () => true, user: { sub } }
        : { isAuthenticated: () => false };
      next();
    };
  }

  return auth({
    authRequired: false,
    auth0Logout: true,
    errorOnRequiredAuth: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.SESSION_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  });
}

export function requireAuth() {
  if (testMode) {
    return (req, res, next) =>
      req.oidc?.isAuthenticated()
        ? next()
        : res.status(401).json({ error: 'Unauthorized' });
  }
  return requiresAuth();
}
