const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/product');
const Category = require('../models/categories');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /products (Create Product)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock } = req.body;

        if (!req.file || !req.file.buffer) {
            return res.status(400).send('Product image file is required');
        }

        // Auto-create category if it does not exist
        if (category && category.trim()) {
            await Category.findOneAndUpdate(
                { name: category.trim() },
                { name: category.trim() },
                { upsert: true }
            );
        }

        await Product.create({
            name: name.trim(),
            price: Number(price),
            category: category.trim(),
            description: description || '',
            stock: Number(stock) || 0,
            image: req.file.buffer
        });

        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).send('Error creating product');
    }
});

// POST /products/delete (from Admin Dashboard Form)
router.post('/delete', async (req, res) => {
    try {
        const { product_id } = req.body;
        if (product_id) {
            await Product.findByIdAndDelete(product_id.trim());
        }
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error deleting product:', err);
        res.redirect('/admin/products');
    }
});

// GET /products/delete/:id (from Admin Products List Link)
router.get('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error deleting product by id:', err);
        res.redirect('/admin/products');
    }
});

// GET /products/edit/:id
router.get('/edit/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.find();
        if (!product) {
            return res.redirect('/admin/products');
        }
        res.render('admin_edit_product', { product, categories });
    } catch (err) {
        console.error('Error loading product edit page:', err);
        res.redirect('/admin/products');
    }
});

// POST /products/edit/:id
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock } = req.body;
        const updateData = {
            name: name.trim(),
            price: Number(price),
            category: category.trim(),
            description: description || '',
            stock: Number(stock) || 0
        };

        if (req.file && req.file.buffer) {
            updateData.image = req.file.buffer;
        }

        if (category && category.trim()) {
            await Category.findOneAndUpdate(
                { name: category.trim() },
                { name: category.trim() },
                { upsert: true }
            );
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/products');
    } catch (err) {
        console.error('Error updating product:', err);
        res.redirect('/admin/products');
    }
});

module.exports = router;
