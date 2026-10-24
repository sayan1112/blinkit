require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blinkit';

// Connect to MongoDB with serverless caching
let isConnected = false;
const connectDB = async () => {
    if (isConnected && mongoose.connection.readyState === 1) return;
    if (!process.env.MONGO_URI && (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
        return;
    }
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 2000,
            connectTimeoutMS: 2000
        });
        isConnected = true;
        console.log('Connected to MongoDB database (blinkit)');
    } catch (err) {
        console.warn('MongoDB connection notice:', err.message);
    }
};
connectDB();

// Middleware to ensure DB connection per serverless invocation
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Core Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'blinkit_super_secret_session_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Global template variables
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    res.locals.currentPath = req.path;
    next();
});

// Routers
const indexRouter = require('./routes/index');
const cartRouter = require('./routes/cart').router;
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const paymentRouter = require('./routes/payment');
const orderRouter = require('./routes/order');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

app.use('/cart', cartRouter);
app.use('/products', productsRouter);
app.use('/categories', categoriesRouter);
app.use('/payment', paymentRouter);
app.use('/order', orderRouter);
app.use('/admin', adminRouter);
app.use('/', authRouter);
app.use('/', indexRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('index', {
        products: {},
        rnproducts: [],
        somethingInCart: false,
        cartCount: 0,
        user: req.session.user || null
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Application Error:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Blinkit server is listening on http://localhost:${PORT}`);
    });
}

module.exports = app;