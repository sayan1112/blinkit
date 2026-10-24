const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: Buffer }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Paid'
    },
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    signature: { type: String, default: '' },
    address: {
        type: String,
        default: 'Sector 22, DLF Phase 2, Gurugram, Haryana'
    },
    status: {
        type: String,
        enum: ['Order Placed', 'Packed', 'Out for Delivery', 'Delivered'],
        default: 'Order Placed'
    }
}, { timestamps: true });

module.exports = mongoose.model("order", orderSchema);
