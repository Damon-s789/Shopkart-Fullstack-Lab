import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const requiredEnvironment = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (missingEnvironment.length) {
  console.error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => res.json({ success: true }));
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(err.statusCode || 500).json({ success: false, message: err.statusCode ? err.message : 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`ShopKart API listening on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
