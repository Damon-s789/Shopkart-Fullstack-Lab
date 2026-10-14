import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/product.model.js';

const products = [
  {
    name: 'Mechanical Keyboard',
    description: 'Compact RGB mechanical keyboard with tactile blue switches and a durable aluminium frame.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
    stock: 10
  },
  {
    name: 'Wireless Headphones',
    description: 'Comfortable over-ear wireless headphones with clear sound and an all-day battery.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    stock: 25
  },
  {
    name: 'Everyday Cotton Shirt',
    description: 'Soft, breathable cotton shirt designed for a comfortable everyday fit.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
    stock: 18
  },
  {
    name: 'Atomic Habits',
    description: 'A practical guide to building good habits and making small changes that last.',
    price: 599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80',
    stock: 40
  },
  {
    name: 'Ceramic Table Lamp',
    description: 'A warm, modern ceramic table lamp for a reading corner, bedside, or work desk.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    stock: 12
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated 750 ml bottle that keeps drinks cold or warm throughout the day.',
    price: 899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80',
    stock: 0
  }
];

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is missing from backend/.env');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const results = await Promise.all(
    products.map((product) => Product.updateOne({ name: product.name }, { $setOnInsert: product }, { upsert: true }))
  );
  const added = results.filter((result) => result.upsertedCount === 1).length;
  console.log(`Product seed complete: ${added} added, ${products.length - added} already present.`);
} catch (error) {
  console.error(`Product seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
