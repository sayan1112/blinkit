const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        default: 10
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: Buffer,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("product", productSchema);
