import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

const productFields = 'name price category image stock';

function validProductId(productId) {
  return mongoose.isValidObjectId(productId);
}

async function loadCart(customerId) {
  const customer = await Customer.findById(customerId).populate({ path: 'cart.product', select: productFields });
  return (customer.cart ?? []).filter((item) => item.product);
}

async function findProductOrRespond(productId, res) {
  if (!validProductId(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
    return null;
  }
  const product = await Product.findById(productId).select('stock');
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return null;
  }
  return product;
}

export async function getCart(req, res, next) {
  try {
    const cart = await loadCart(req.user._id);
    return res.json({ success: true, cart });
  } catch (error) {
    return next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await findProductOrRespond(productId, res);
    if (!product) return;

    const customer = await Customer.findById(req.user._id);
    const existingItem = (customer.cart ?? []).find((item) => item.product.toString() === productId);
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
    if (newQuantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }
    if (existingItem) existingItem.quantity = newQuantity;
    else customer.cart.push({ product: productId, quantity: 1 });
    await customer.save();
    const cart = await loadCart(customer._id);
    return res.status(201).json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return next(error);
  }
}

export async function updateCartQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const product = await findProductOrRespond(productId, res);
    if (!product) return;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be a whole number of at least 1' });
    }
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }
    const customer = await Customer.findById(req.user._id);
    const item = (customer.cart ?? []).find((cartItem) => cartItem.product.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: 'Product is not in cart' });
    item.quantity = quantity;
    await customer.save();
    const cart = await loadCart(customer._id);
    return res.json({ success: true, message: 'Cart quantity updated', cart });
  } catch (error) {
    return next(error);
  }
}

export async function removeFromCart(req, res, next) {
  try {
    const { productId } = req.params;
    if (!validProductId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const customer = await Customer.findById(req.user._id);
    const originalLength = (customer.cart ?? []).length;
    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    if (customer.cart.length === originalLength) {
      return res.status(404).json({ success: false, message: 'Product is not in cart' });
    }
    await customer.save();
    const cart = await loadCart(customer._id);
    return res.json({ success: true, message: 'Product removed from cart', cart });
  } catch (error) {
    return next(error);
  }
}
