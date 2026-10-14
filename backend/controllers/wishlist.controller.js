import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

function isValidProductId(productId) {
  return mongoose.isValidObjectId(productId);
}

async function ensureProduct(productId, res) {
  if (!isValidProductId(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
    return false;
  }
  const product = await Product.exists({ _id: productId });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return false;
  }
  return true;
}

export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    if (!(await ensureProduct(productId, res))) return;

    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } }
    );
    if (result.modifiedCount === 0) {
      return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
    }
    return res.status(201).json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    return next(error);
  }
}

export async function getWishlist(req, res, next) {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });
    const wishlist = customer.wishlist?.filter(Boolean) ?? [];
    return res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    return next(error);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    if (!isValidProductId(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product is not in wishlist' });
    }
    return res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    return next(error);
  }
}

export async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    if (!(await ensureProduct(productId, res))) return;

    const isSaved = (req.user.wishlist ?? []).some((id) => id.toString() === productId);
    await Customer.updateOne(
      { _id: req.user._id },
      isSaved ? { $pull: { wishlist: productId } } : { $addToSet: { wishlist: productId } }
    );
    return res.json({ success: true, saved: !isSaved, message: isSaved ? 'Product removed from wishlist' : 'Product added to wishlist' });
  } catch (error) {
    return next(error);
  }
}
