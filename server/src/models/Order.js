import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  emoji: String,
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Order has no items'] },
    shipping: {
      fullName: { type: String, required: [true, 'Full name is required'], trim: true },
      phone: { type: String, required: [true, 'Phone number is required'], trim: true },
      address: { type: String, required: [true, 'Address is required'], trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      postalCode: { type: String, required: [true, 'PIN code is required'], trim: true },
    },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Placed' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
