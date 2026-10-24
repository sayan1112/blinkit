const express = require('express');
const router = express.Router();
const Category = require('../models/categories');

// POST /categories/create
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;
        if (name && name.trim()) {
            await Category.findOneAndUpdate(
                { name: name.trim() },
                { name: name.trim() },
                { upsert: true }
            );
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('Error creating category:', err);
        res.redirect('/admin');
    }
});

// GET /categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
