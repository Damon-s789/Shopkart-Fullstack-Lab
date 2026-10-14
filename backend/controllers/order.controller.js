import crypto from 'crypto';
import mongoose from 'mongoose';
import { getRazorpayClient } from '../config/razorpay.js';
import Customer from '../models/customer.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

const addressKeys = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

function validateAddress(address) {
  if (!address || typeof address !== 'object') return 'Shipping address is required';
  if (addressKeys.some((key) => typeof address[key] !== 'string' || !address[key].trim())) return 'All shipping address fields are required';
  if (!/^\d{10}$/.test(address.phone.trim())) return 'Phone number must contain 10 digits';
  if (!/^\d{6}$/.test(address.pincode.trim())) return 'Pincode must contain 6 digits';
  return '';
}

function cleanAddress(address) {
  return Object.fromEntries(addressKeys.map((key) => [key, address[key].trim()]));
}

export async function createPaymentOrder(req, res, next) {
  let pendingOrder;
  try {
    const validationError = validateAddress(req.body.shippingAddress);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const customer = await Customer.findById(req.user._id).populate({ path: 'cart.product', select: 'name price image stock' });
    const cart = (customer.cart ?? []).filter((item) => item.product);
    if (!cart.length) return res.status(400).json({ success: false, message: 'Your cart is empty' });

    const products = await Product.find({ _id: { $in: cart.map((item) => item.product._id) } }).select('name price image stock');
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));
    let totalAmount = 0;
    const items = cart.map((cartItem) => {
      const product = productsById.get(cartItem.product._id.toString());
      if (!product) throw Object.assign(new Error('A product in your cart is no longer available'), { statusCode: 400 });
      if (cartItem.quantity > product.stock) throw Object.assign(new Error(`Insufficient stock for ${product.name}.`), { statusCode: 400 });
      totalAmount += product.price * cartItem.quantity;
      return { product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image };
    });

    pendingOrder = await Order.create({ user: customer._id, items, shippingAddress: cleanAddress(req.body.shippingAddress), totalAmount });
    const razorpayOrder = await getRazorpayClient().orders.create({ amount: Math.round(totalAmount * 100), currency: 'INR', receipt: pendingOrder._id.toString() });
    pendingOrder.razorpayOrderId = razorpayOrder.id;
    await pendingOrder.save();
    return res.status(201).json({ success: true, shopKartOrderId: pendingOrder._id, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (pendingOrder && !pendingOrder.razorpayOrderId) { pendingOrder.paymentStatus = 'FAILED'; await pendingOrder.save().catch(() => {}); }
    return next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { shopKartOrderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;
    if (!mongoose.isValidObjectId(shopKartOrderId) || ![razorpayOrderId, razorpayPaymentId, razorpaySignature].every((value) => typeof value === 'string' && value)) return res.status(400).json({ success: false, message: 'Incomplete payment verification data' });
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'PAID') return res.status(409).json({ success: false, message: 'Order is already paid' });
    if (order.razorpayOrderId !== razorpayOrderId) return res.status(400).json({ success: false, message: 'Invalid payment order' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${order.razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
    const valid = razorpaySignature.length === expected.length && crypto.timingSafeEqual(Buffer.from(razorpaySignature), Buffer.from(expected));
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    order.paymentStatus = 'PAID'; order.status = 'PLACED'; order.razorpayPaymentId = razorpayPaymentId;
    await order.save();
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    return res.json({ success: true, message: 'Payment verified and order placed', order });
  } catch (error) { return next(error); }
}

export async function getOrders(req, res, next) {
  try { const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); return res.json({ success: true, orders }); } catch (error) { return next(error); }
}

export async function getOrderById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid order ID' });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order });
  } catch (error) { return next(error); }
}
