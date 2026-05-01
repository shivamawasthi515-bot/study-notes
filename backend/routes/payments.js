const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const rateLimit = require('express-rate-limit');
const Payment = require('../models/Payment');
const Subject = require('../models/Subject');
const User = require('../models/User');
const auth = require('../middleware/auth');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests, please try again later.' }
});

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', paymentLimiter, auth, async (req, res) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId) return res.status(400).json({ message: 'Subject ID is required' });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    if (subject.accessType === 'free') {
      return res.status(400).json({ message: 'This subject is free' });
    }

    // Check if already purchased
    const user = await User.findById(req.user._id);
    if (user.purchasedSubjects.map(id => id.toString()).includes(subjectId)) {
      return res.status(400).json({ message: 'Subject already purchased' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: subject.title,
            description: subject.description || 'Study Notes'
          },
          unit_amount: Math.round(subject.price * 100) // cents
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subjects/${subjectId}`,
      metadata: {
        userId: req.user._id.toString(),
        subjectId: subjectId
      }
    });

    // Create pending payment record
    await Payment.create({
      user: req.user._id,
      subject: subjectId,
      amount: subject.price,
      stripeSessionId: session.id,
      status: 'pending'
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Payment error', error: err.message });
  }
});

// GET /api/payments/verify/:sessionId
router.get('/verify/:sessionId', paymentLimiter, auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { status: 'completed', stripePaymentIntentId: session.payment_intent || '' },
        { new: true }
      );

      if (payment) {
        // Add subject to user's purchased list if not already there
        await User.findByIdAndUpdate(payment.user, {
          $addToSet: { purchasedSubjects: payment.subject }
        });
      }

      res.json({ success: true, payment });
    } else {
      res.json({ success: false, status: session.payment_status });
    }
  } catch (err) {
    res.status(500).json({ message: 'Verification error', error: err.message });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'completed', stripePaymentIntentId: session.payment_intent || '' },
        { new: true }
      );

      if (payment) {
        await User.findByIdAndUpdate(payment.user, {
          $addToSet: { purchasedSubjects: payment.subject }
        });
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.json({ received: true });
});

module.exports = router;
