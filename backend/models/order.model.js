import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, name: { type: String, required: true }, price: { type: Number, required: true, min: 0 }, quantity: { type: Number, required: true, min: 1 }, image: { type: String, default: '' } }, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, 'Order requires at least one item'] },
    shippingAddress: { fullName: { type: String, required: true }, phone: { type: String, required: true }, addressLine1: { type: String, required: true }, city: { type: String, required: true }, state: { type: String, required: true }, pincode: { type: String, required: true } },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    status: { type: String, enum: ['PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'], default: 'PENDING_PAYMENT' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model('Order', orderSchema);
