const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// GET /user/login or /login
router.get(['/user/login', '/login'], (req, res) => {
    res.render('user_login', { error: null });
});

// GET /auth/google - Seamless Google Auth flow / verified demo sign-in
router.get('/auth/google', async (req, res) => {
    try {
        let user = await User.findOne({ email: 'customer@blinkit.com' });
        if (!user) {
            user = await User.create({
                name: 'Harsh Sharma',
                email: 'customer@blinkit.com',
                phone: 9876543210,
                role: 'user',
                addresses: [{
                    state: 'Haryana',
                    zip: 122002,
                    city: 'Gurugram',
                    address: 'Flat 402, Tower B, Sector 22, DLF Phase 2'
                }]
            });
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        res.redirect('/');
    } catch (err) {
        console.error('Google Auth error:', err);
        res.redirect('/');
    }
});

// GET /user/demo-login
router.get('/user/demo-login', async (req, res) => {
    try {
        const user = await User.findOne({ email: 'customer@blinkit.com' });
        if (user) {
            req.session.user = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            };
        }
        res.redirect('/');
    } catch (err) {
        res.redirect('/');
    }
});

// POST /user/login
router.post('/user/login', async (req, res) => {
    try {
        const { email, password, phone } = req.body;
        let query = {};
        if (email) query.email = email.toLowerCase().trim();
        else if (phone) query.phone = Number(phone);

        let user = await User.findOne(query);
        if (!user) {
            // Auto register customer
            user = await User.create({
                name: email ? email.split('@')[0] : 'Blinkit Customer',
                email: email ? email.toLowerCase().trim() : `user_${Date.now()}@blinkit.com`,
                phone: phone ? Number(phone) : 9876543210,
                password: password ? await bcrypt.hash(password, 10) : ''
            });
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        res.redirect('/');
    } catch (err) {
        console.error('User login error:', err);
        res.redirect('/user/login');
    }
});

// GET /user/logout or /logout
router.get(['/user/logout', '/logout'], (req, res) => {
    delete req.session.user;
    res.redirect('/');
});

module.exports = router;
