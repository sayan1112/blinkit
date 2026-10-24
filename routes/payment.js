const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getCartData } = require('./cart');

let razorpayInstance = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        const Razorpay = require('razorpay');
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
} catch (e) {
    console.log('Razorpay not configured, test mode enabled.');
}

// POST /payment/create/orderId
router.post('/create/orderId', async (req, res) => {
    try {
        const { finalprice } = await getCartData(req);
        const amount = Math.max(finalprice, 1) * 100; // in paise

        if (razorpayInstance) {
            const options = {
                amount: amount,
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`
            };
            const order = await razorpayInstance.orders.create(options);
            return res.json(order);
        }

        // Development/Test simulated order ID
        const fakeOrderId = `order_${Date.now()}_test`;
        return res.json({
            id: fakeOrderId,
            amount: amount,
            currency: 'INR',
            status: 'created'
        });
    } catch (err) {
        console.error('Error creating payment order:', err);
        res.status(500).json({ error: 'Failed to create order ID' });
    }
});

// POST /payment/api/payment/verify
router.post('/api/payment/verify', (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

        if (razorpayInstance && process.env.RAZORPAY_KEY_SECRET) {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
            hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
            const generatedSignature = hmac.digest('hex');

            if (generatedSignature !== signature) {
                return res.status(400).json({ status: 'failure', message: 'Signature verification failed' });
            }
        }

        // Verified or test mode accepted
        return res.json({ status: 'success', message: 'Payment verified successfully' });
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ status: 'failure', message: err.message });
    }
});

module.exports = router;
