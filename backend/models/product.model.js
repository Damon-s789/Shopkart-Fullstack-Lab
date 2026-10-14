import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default mongoose.model('Product', productSchema);
