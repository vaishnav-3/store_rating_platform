// Check if user has required role(s)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = requireRole('admin');

// Check if user is store owner
export const requireStoreOwner = requireRole('store_owner');

// Check if user is normal user or admin (excludes store owners from certain actions)
export const requireUserOrAdmin = requireRole('user', 'admin');

// Check if user is store owner or admin
export const requireStoreOwnerOrAdmin = requireRole('store_owner', 'admin');

// Check if user can rate stores (users and admins, but not store owners rating their own store)
export const canRateStore = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Store owners cannot rate any stores to avoid conflicts of interest
  if (req.user.role === 'store_owner') {
    return res.status(403).json({
      success: false,
      message: 'Store owners cannot submit ratings'
    });
  }

  // Users and admins can rate stores
  if (['user', 'admin'].includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
};