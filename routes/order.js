const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const { getCartData } = require('./cart');

// GET /order/:userid/:orderId/:paymentId/:signature
router.get('/:userid/:orderId/:paymentId/:signature', async (req, res) => {
    try {
        const { userid, orderId, paymentId, signature } = req.params;
        const { cart, finalprice } = await getCartData(req);

        let user = null;
        if (userid && userid.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userid);
        }
        if (!user && req.session.user) {
            user = await User.findById(req.session.user._id);
        }
        if (!user) {
            user = await User.findOne({ email: 'customer@blinkit.com' });
        }

        const orderItems = cart.map(item => ({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        const newOrder = await Order.create({
            user: user ? user._id : null,
            items: orderItems,
            totalAmount: finalprice || 150,
            paymentStatus: 'Paid',
            paymentId: paymentId || `pay_${Date.now()}`,
            orderId: orderId || `order_${Date.now()}`,
            signature: signature || 'test_sig',
            address: user && user.addresses && user.addresses.length > 0 ? user.addresses[0].address : 'Sector 22, DLF Phase 2, Gurugram',
            status: 'Order Placed'
        });

        // Clear cart
        req.session.cart = {};
        if (user) {
            user.cart = [];
            await user.save();
        }

        res.redirect(`/order/map/${newOrder._id}`);
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).send('Error creating order');
    }
});

// GET /order/map/:orderid
router.get('/map/:orderid', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderid);
        res.render('map', {
            orderid: req.params.orderid,
            order: order || null
        });
    } catch (err) {
        console.error('Error loading map:', err);
        res.status(500).send('Error loading map');
    }
});

// POST /order/address/:orderid
router.post('/address/:orderid', async (req, res) => {
    try {
        const { address } = req.body;
        const order = await Order.findById(req.params.orderid);
        if (order) {
            if (address && address.trim()) {
                order.address = address.trim();
            }
            order.status = 'Out for Delivery';
            await order.save();
        }
        res.redirect(`/order/track/${req.params.orderid}`);
    } catch (err) {
        console.error('Error saving order address:', err);
        res.redirect(`/order/track/${req.params.orderid}`);
    }
});

// GET /order/track/:orderid
router.get('/track/:orderid', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderid).populate('user');
        if (!order) {
            return res.redirect('/');
        }
        res.render('order_track', { order });
    } catch (err) {
        console.error('Error tracking order:', err);
        res.redirect('/');
    }
});

// GET /orders
router.get('/history/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.render('admin_orders', { orders });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.redirect('/admin');
    }
});

module.exports = router;
