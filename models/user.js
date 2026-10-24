const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    state: { type: String, default: '' },
    zip: { type: Number, default: 0 },
    city: { type: String, default: '' },
    address: { type: String, default: '' }
});

const userSchema = new mongoose.Schema({
    name: { type: String, default: 'Customer' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '' },
    phone: { type: Number, default: 9999999999 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [addressSchema],
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number, default: 1 }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema);