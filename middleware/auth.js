const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Please login first' });
};

const isAuthority = (req, res, next) => {
  if (req.session && req.session.user && (req.session.user.role === 'authority' || req.session.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Authority access required' });
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
};

module.exports = { isAuthenticated, isAuthority, isAdmin };
