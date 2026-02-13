import jwt from 'jsonwebtoken';

async function adminAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - No token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token
    if (
      decoded.admin !==
      process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized - Invalid token',
    });
  }
}

export default adminAuth;
