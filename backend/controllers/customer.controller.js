import Customer from '../models/customer.model.js';
import { authCookieOptions, generateToken } from '../utils/generateToken.js';

function publicCustomer(customer) {
  return {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone
  };
}

export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    if (![fullName, email, password, phone].every((field) => typeof field === 'string' && field.trim())) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await Customer.exists({ email: normalizedEmail });
    if (exists) return res.status(409).json({ success: false, message: 'Email already exists' });

    const customer = await Customer.create({ fullName, email: normalizedEmail, password, phone });
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: publicCustomer(customer)
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' });
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const customer = await Customer.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.cookie('token', generateToken(customer._id.toString()), authCookieOptions);
    return res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    return next(error);
  }
}

export function getMe(req, res) {
  return res.json(publicCustomer(req.user));
}

export function logout(_req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ success: true, message: 'Logged out successfully' });
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'A valid old password and a new password of at least 6 characters are required' });
    }
    const customer = await Customer.findById(req.user._id).select('+password');
    if (!(await customer.comparePassword(oldPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    customer.password = newPassword;
    await customer.save();
    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return next(error);
  }
}
