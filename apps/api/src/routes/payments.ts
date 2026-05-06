import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../server';
import { authenticateUser } from '../middleware/auth';

const router = Router();

function getStripeClient() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY in environment. Payment operations are disabled.');
  }
  return new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });
}

function ensureStripe(req: any, res: any) {
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.' });
    return false;
  }
  return true;
}

// POST /payments/create-subscription
router.post('/create-subscription', authenticateUser, async (req, res) => {
  try {
    const { tier } = req.body; // 'plus' or 'gold'
    const userId = req.user!.id;

    const prices = {
      plus: process.env.STRIPE_PLUS_PRICE_ID,
      gold: process.env.STRIPE_GOLD_PRICE_ID
    };

    const priceId = prices[tier as keyof typeof prices];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    if (!ensureStripe(req, res)) return;
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        user_id: userId,
        tier
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// POST /payments/webhook
router.post('/webhook', async (req, res) => {
  try {
    if (!ensureStripe(req, res)) return;
    const stripe = getStripeClient();
    const sig = req.headers['stripe-signature']!;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, tier } = session.metadata!;

      await supabase
        .from('profiles')
        .update({ subscription_tier: tier })
        .eq('id', user_id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error}`);
  }
});

// GET /payments/portal
router.get('/portal', authenticateUser, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get or create customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!ensureStripe(req, res)) return;
    const stripe = getStripeClient();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id: userId }
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.FRONTEND_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;