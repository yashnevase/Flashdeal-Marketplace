const express = require('express');
const router = express.Router();
const Joi = require('joi');
const s_payment = require('../services/s_payment');
const s_order = require('../services/s_order');
const { verifyToken, checkRole } = require('../lib/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Joi schema for creating Razorpay order
const createRazorpayOrderSchema = Joi.object({
    order_id: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().valid('INR').default('INR'),
});

// Joi schema for verifying Razorpay payment
const verifyRazorpayPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
    order_id: Joi.number().integer().positive().required(), // Our internal order ID
});

// POST /api/payments/create-order — Create Razorpay order
router.post('/payments/create-order', verifyToken, checkRole(['Buyer']), async (req, res) => {
    try {
        const { error, value } = createRazorpayOrderSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { order_id, amount, currency } = value;

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: currency,
            receipt: `receipt_order_${order_id}`,
            notes: { internal_order_id: String(order_id) }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Store payment details in our DB with 'Pending' status
        await s_payment.createPayment(order_id, 'Razorpay', amount, 'Pending');

        res.json({ message: 'Razorpay order created', razorpayOrder });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/payments/key — Expose Razorpay public key for frontend checkout
router.get('/payments/key', verifyToken, checkRole(['Buyer']), (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID) {
            return res.status(500).json({ message: 'Razorpay key not configured' });
        }
        res.json({ key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.error('Error fetching Razorpay key:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/payments/verify — Verify Razorpay payment signature
// router.post('/payments/verify',  async (req, res) => {
//     try {
//         const { error, value } = verifyRazorpayPaymentSchema.validate(req.body);
//         if (error) return res.status(400).json({ message: error.details[0].message });

//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = value;

//         const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//         shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//         const digest = shasum.digest('hex');

//         if (digest === razorpay_signature) {
//             // Payment is successful
//             await s_payment.updatePaymentStatus(order_id, 'Completed'); // Update payment status
//             await s_order.updateOrderStatus(order_id, 'Confirmed'); // Update internal order status
//             res.json({ message: 'Payment successful and order confirmed' });
//         } else {
//             // Payment failed
//             await s_payment.updatePaymentStatus(order_id, 'Failed'); // Update payment status
//             res.status(400).json({ message: 'Payment verification failed' });
//         }
//     } catch (error) {
//         console.error('Error verifying Razorpay payment:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

router.post('/payments/verify', async (req, res) => {
    try {
        // Log incoming request body
        console.log('Incoming verification payload:', req.body);

        const { error, value } = verifyRazorpayPaymentSchema.validate(req.body);
        if (error) {
            console.error('Validation Error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id
        } = value;

        // Log raw values
        console.log('razorpay_order_id:', razorpay_order_id);
        console.log('razorpay_payment_id:', razorpay_payment_id);
        console.log('razorpay_signature:', razorpay_signature);

        // Generate HMAC SHA256 hash
        const bodyToHash = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log('String to be hashed:', bodyToHash);

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(bodyToHash);
        const digest = shasum.digest('hex');

        // Log generated digest vs expected signature
        console.log('Generated digest:', digest);
        console.log('Signature from Razorpay:', razorpay_signature);

        if (digest === razorpay_signature) {
            console.log('✅ Payment signature verified. Updating status...');
            await s_payment.updatePaymentStatusByOrderId(order_id, 'Completed');
            // await s_order.updateOrderStatus(order_id, 'Confirmed');

            return res.json({ message: 'Payment successful and order confirmed' });
        } else {
            console.warn('❌ Payment signature mismatch!');
            await s_payment.updatePaymentStatusByOrderId(order_id, 'Failed');
            return res.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('🔥 Error verifying Razorpay payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;

// --- Webhook handler (exported for server wiring) ---
async function handleRazorpayWebhook(req, res) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('Webhook secret not configured');
            return res.status(500).end();
        }

        const signature = req.headers['x-razorpay-signature'];
        const body = req.body; // Buffer when using express.raw()

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('Invalid webhook signature');
            return res.status(400).end();
        }

        const payload = JSON.parse(body.toString('utf8'));
        const event = payload.event;

        // Try to extract our internal order id from notes
        let internalOrderId = undefined;
        if (payload?.payload?.payment?.entity?.notes?.internal_order_id) {
            internalOrderId = Number(payload.payload.payment.entity.notes.internal_order_id);
        } else if (payload?.payload?.order?.entity?.notes?.internal_order_id) {
            internalOrderId = Number(payload.payload.order.entity.notes.internal_order_id);
        }

        if (!internalOrderId || Number.isNaN(internalOrderId)) {
            console.warn('Webhook received without internal_order_id in notes');
            return res.status(200).end();
        }

        if (event === 'payment.captured' || event === 'order.paid') {
            await s_payment.updatePaymentStatusByOrderId(internalOrderId, 'Completed');
            // await s_order.updateOrderStatus(internalOrderId, 'Confirmed');
        } else if (event === 'payment.failed') {
            await s_payment.updatePaymentStatusByOrderId(internalOrderId, 'Failed');
        } else if (event === 'refund.processed' || event === 'refund.created') {
            await s_payment.updatePaymentStatusByOrderId(internalOrderId, 'Refunded');
            await s_order.updateOrderStatus(internalOrderId, 'Cancelled');
        }

        return res.status(200).end();
    } catch (error) {
        console.error('Error handling Razorpay webhook:', error);
        return res.status(500).end();
    }
}

module.exports.handleRazorpayWebhook = handleRazorpayWebhook;
