import User from '../database/models/User.js';
import jwt from 'jsonwebtoken';
import Profile from '../database/models/Profile.js';

// Sign Token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Send Token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // Remove password from output

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Signup
export const signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Update Profile (Edit Profile)
export const updateMe = async (req, res, next) => {
  try {
    if (req.body.password) {
      return res.status(400).json({ status: 'fail', message: 'This route is not for password updates' });
    }

    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Change Password
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Current password is wrong' });
    }

    user.password = req.body.password;
    await user.save();
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Delete Account
export const deleteMe = async (req, res, next) => {
  try {
    // Delete user and associated profiles
    await Profile.deleteMany({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Get Current User (Me)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
