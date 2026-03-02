const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password Step 1: Send OTP
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Forgot Password Step 2: Verify OTP
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/reset-password
// @desc    Forgot Password Step 3: Set New Password
// @access  Public
router.post('/reset-password', resetPassword);

module.exports = router;
