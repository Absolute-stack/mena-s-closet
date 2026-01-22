import jwt from 'jsonwebtoken';

async function userAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Please login',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Invalid token',
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('User auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized - Invalid token',
    });
  }
}

export default userAuth;
