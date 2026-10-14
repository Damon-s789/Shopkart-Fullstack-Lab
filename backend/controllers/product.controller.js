import mongoose from 'mongoose';
import Product from '../models/product.model.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, image, stock } = req.body;
    if (![name, description, category, image].every(hasText)) {
      return res.status(400).json({ success: false, message: 'Name, description, category and image are required' });
    }
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a number greater than 0' });
    }
    if (typeof stock !== 'number' || !Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a number that is 0 or greater' });
    }

    const product = await Product.create({ name, description, price, category, image, stock });
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
}

export async function getProducts(req, res, next) {
  try {
    const { search, category, sort } = req.query;
    const query = {};
    if (hasText(search)) query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (hasText(category)) query.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' };

    const sortBy = sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };
    const products = await Product.find(query).select('name price category image stock createdAt').sort(sortBy);
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, product });
  } catch (error) {
    return next(error);
  }
}
