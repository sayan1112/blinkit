const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/categories');
const { getCartData } = require('./cart');

// GET / (Storefront Homepage)
router.get('/', async (req, res) => {
    try {
        const { cartCount } = await getCartData(req);
        const somethingInCart = cartCount > 0;

        // Fetch all products
        const allProducts = await Product.find().sort({ createdAt: -1 });

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
            user: req.session.user || null
        });
    } catch (err) {
        console.error('Error loading storefront homepage:', err);
        res.status(500).send('Error loading storefront');
    }
});

// GET /search (Search products)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const { cartCount } = await getCartData(req);
        const somethingInCart = cartCount > 0;

        let query = {};
        if (q && q.trim()) {
            query = {
                $or: [
                    { name: { $regex: q.trim(), $options: 'i' } },
                    { category: { $regex: q.trim(), $options: 'i' } },
                    { description: { $regex: q.trim(), $options: 'i' } }
                ]
            };
        }

        const foundProducts = await Product.find(query);
        const products = {};
        for (const prod of foundProducts) {
            const cat = prod.category || 'Results';
            if (!products[cat]) {
                products[cat] = [];
            }
            products[cat].push(prod);
        }

        const rnproducts = foundProducts.slice(0, 5);

        res.render('index', {
            products,
            rnproducts,
            somethingInCart,
            cartCount,
            user: req.session.user || null,
            searchQuery: q || ''
        });
    } catch (err) {
        console.error('Search error:', err);
        res.redirect('/');
    }
});

module.exports = router;