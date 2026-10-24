const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');

// Helper to get populated cart array and totals
async function getCartData(req) {
    if (!req.session.cart) {
        req.session.cart = {};
    }

    const cartMap = req.session.cart; // { [productId]: quantity }
    const productIds = Object.keys(cartMap).filter(id => cartMap[id] > 0);

    let products = [];
    try {
        if (mongoose.connection.readyState === 1 && productIds.length > 0) {
            products = await Product.find({ _id: { $in: productIds } });
        }
    } catch (e) {
        products = [];
    }

    const cart = [];
    let itemsTotal = 0;
    let cartCount = 0;

    for (const prod of products) {
        const qty = cartMap[prod._id.toString()] || 0;
        if (qty > 0) {
            cart.push({
                _id: prod._id,
                name: prod.name,
                price: prod.price,
                stock: prod.stock,
                image: prod.image,
                quantity: qty
            });
            itemsTotal += prod.price * qty;
            cartCount += qty;
        }
    }

    const finalprice = cart.length > 0 ? itemsTotal + 34 : 0; // ₹30 delivery + ₹4 handling

    return { cart, itemsTotal, finalprice, cartCount };
}

// GET /cart
router.get('/', async (req, res) => {
    try {
        const { cart, finalprice } = await getCartData(req);

        // Fallback default user if not logged in
        let userid = req.session.user ? req.session.user._id : null;
        if (!userid) {
            const demoUser = await User.findOne({ email: 'customer@blinkit.com' });
            userid = demoUser ? demoUser._id : '6651234567890abcdef12345';
        }

        res.render('cart', {
            cart,
            finalprice,
            userid,
            user: req.session.user || null
        });
    } catch (err) {
        console.error('Error rendering cart:', err);
        res.status(500).send('Error loading cart');
    }
});

// GET /cart/add/:id
router.get('/add/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.redirect(req.get('Referrer') || '/');
        }

        if (!req.session.cart) {
            req.session.cart = {};
        }

        req.session.cart[productId] = (req.session.cart[productId] || 0) + 1;

        // If user is logged in, sync with DB user cart as well
        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (user) {
                const itemIndex = user.cart.findIndex(i => i.product && i.product.toString() === productId);
                if (itemIndex > -1) {
                    user.cart[itemIndex].quantity += 1;
                } else {
                    user.cart.push({ product: productId, quantity: 1 });
                }
                await user.save();
            }
        }

        res.redirect(req.get('Referrer') || '/');
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.redirect(req.get('Referrer') || '/');
    }
});

// GET /cart/remove/:id
router.get('/remove/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if (!req.session.cart) {
            req.session.cart = {};
        }

        if (req.session.cart[productId]) {
            req.session.cart[productId] -= 1;
            if (req.session.cart[productId] <= 0) {
                delete req.session.cart[productId];
            }
        }

        if (req.session.user) {
            const user = await User.findById(req.session.user._id);
            if (user) {
                const itemIndex = user.cart.findIndex(i => i.product && i.product.toString() === productId);
                if (itemIndex > -1) {
                    if (user.cart[itemIndex].quantity > 1) {
                        user.cart[itemIndex].quantity -= 1;
                    } else {
                        user.cart.splice(itemIndex, 1);
                    }
                    await user.save();
                }
            }
        }

        res.redirect(req.get('Referrer') || '/cart');
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.redirect(req.get('Referrer') || '/cart');
    }
});

// GET /cart/clear
router.get('/clear', (req, res) => {
    req.session.cart = {};
    res.redirect('/cart');
});

module.exports = { router, getCartData };
