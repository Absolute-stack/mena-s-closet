import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import userModel from '../models/userModel.js';

function createToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name Email and Password are required',
      });
    }

    const duplicate = await userModel.findOne({ email });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'This Email Already Exists',
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please Input A Valid Email',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter',
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter',
      });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number',
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: encryptedPassword,
    });

    await newUser.save();
    const token = createToken(newUser._id);
    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `User Creation Failed`,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both Email and Password Are Required',
      });
    }
    const user = await userModel.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email Or Password',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email Or Password',
      });
    }
    const token = createToken(user._id);
    return res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      })
      .status(200)
      .json({
        success: true,
        message: 'User Successfully Logged In',
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something Went Wrong. Please Try Again',
    });
  }
}

async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Email or Password',
      });
    }
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Credentials',
      });
    }
    const token = jwt.sign(
      { admin: process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: 'Admin Login Successful',
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Something Went Wrong. Please Try Again Later',
    });
  }
}

async function verifyUser(req, res) {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'unauthorized User' });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (decode)
      return res.status(200).json({
        success: true,
      });
  } catch (error) {
    res.status(500).json({ success: false });
  }
}

async function getUserData(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findById(decoded.id)
      .select('-password')
      .lean();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
}

async function userLogout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
}

export {
  registerUser,
  loginUser,
  loginAdmin,
  verifyUser,
  userLogout,
  getUserData,
};
