const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const { getCartData } = require('./cart');

// 1x1 transparent PNG fallback buffer
const placeholderBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

const fallbackProducts = [
    { _id: '665000000000000000000001', name: 'Amul Taaza Fresh Toned Milk (500ml)', price: 27, category: 'Dairy & Breakfast', stock: 50, image: placeholderBuffer },
    { _id: '665000000000000000000002', name: 'Amul Salted Butter (100g)', price: 58, category: 'Dairy & Breakfast', stock: 45, image: placeholderBuffer },
    { _id: '665000000000000000000003', name: 'Britannia Whole Wheat Brown Bread', price: 45, category: 'Dairy & Breakfast', stock: 30, image: placeholderBuffer },
    { _id: '665000000000000000000004', name: 'Farm Fresh White Eggs (6 pcs)', price: 54, category: 'Dairy & Breakfast', stock: 60, image: placeholderBuffer },
    { _id: '665000000000000000000005', name: 'Fresh Red Onion (1 kg)', price: 38, category: 'Fruits & Vegetables', stock: 100, image: placeholderBuffer },
    { _id: '665000000000000000000006', name: 'Hybrid Fresh Tomatoes (1 kg)', price: 34, category: 'Fruits & Vegetables', stock: 90, image: placeholderBuffer },
    { _id: '665000000000000000000007', name: 'Fresh Jyoti Potato (1 kg)', price: 28, category: 'Fruits & Vegetables', stock: 120, image: placeholderBuffer },
    { _id: '665000000000000000000008', name: "Lay's India's Magic Masala Chips", price: 20, category: 'Snacks & Munchies', stock: 80, image: placeholderBuffer },
    { _id: '665000000000000000000009', name: 'Uncle Chipps Spicy Treat (48g)', price: 20, category: 'Snacks & Munchies', stock: 75, image: placeholderBuffer },
    { _id: '665000000000000000000010', name: 'Coca-Cola Soft Drink Bottle (750 ml)', price: 40, category: 'Cold Drinks & Juices', stock: 65, image: placeholderBuffer },
    { _id: '665000000000000000000011', name: 'Maggi 2-Minute Masala Noodles (4 pk)', price: 56, category: 'Instant & Packaged Food', stock: 120, image: placeholderBuffer }
];

// GET / (Storefront Homepage)
router.get('/', async (req, res) => {
    try {
        let cartCount = 0;
        try {
            const cartRes = await getCartData(req);
            cartCount = cartRes.cartCount;
        } catch (e) {
            cartCount = 0;
        }
        const somethingInCart = cartCount > 0;

        let allProducts = [];
        try {
            if (mongoose.connection.readyState === 1) {
                allProducts = await Product.find().sort({ createdAt: -1 });
            }
        } catch (err) {
            console.warn('DB fetch warning:', err.message);
        }

        if (!allProducts || allProducts.length === 0) {
            allProducts = fallbackProducts;
        }

        // Group products by category
        const products = {};
        for (const prod of allProducts) {
            const cat = prod.category || 'General';
            if (!products[cat]) {
                products[cat] = [];
            }
            products[cat].push(prod);
        }

        // Random or popular products for "Order Now" section
        const rnproducts = allProducts.slice(0, 10);

        res.render('index', {
            products,
            rnproducts,
            somethingInCart,
            cartCount,
            user: req.session ? req.session.user : null
        });
    } catch (err) {
        console.error('Error loading storefront homepage:', err);
        res.status(500).send('Error loading storefront: ' + err.message);
    }
});

// GET /search (Search products)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let cartCount = 0;
        try {
            const cartRes = await getCartData(req);
            cartCount = cartRes.cartCount;
        } catch (e) {
            cartCount = 0;
        }
        const somethingInCart = cartCount > 0;

        let foundProducts = [];
        try {
            if (mongoose.connection.readyState === 1 && q && q.trim()) {
                foundProducts = await Product.find({
                    $or: [
                        { name: { $regex: q.trim(), $options: 'i' } },
                        { category: { $regex: q.trim(), $options: 'i' } }
                    ]
                });
            }
        } catch (e) {
            console.warn('Search query warning:', e.message);
        }

        if (foundProducts.length === 0 && q) {
            foundProducts = fallbackProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
        }

        const products = {};
        for (const prod of foundProducts) {
            const cat = prod.category || 'Results';
            if (!products[cat]) {
                products[cat] = [];
            }
            products[cat].push(prod);
        }

        res.render('index', {
            products,
            rnproducts: foundProducts.slice(0, 5),
            somethingInCart,
            cartCount,
            user: req.session ? req.session.user : null,
            searchQuery: q || ''
        });
    } catch (err) {
        console.error('Search error:', err);
        res.redirect('/');
    }
});

module.exports = router;