export const adminAuth = (req, res, next) => {
  try {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error in admin authorization' });
  }
};
