import { Router } from 'express';
import Stripe from 'stripe';
import { getEnv } from '../config/env.js';
import { getStripe, ensureStripeCustomerForUid } from '../services/stripe.js';
import { UserModel } from '../models/User.js';
import { authMiddleware, type AuthedRequest } from '../middleware/auth.js';

export function stripeWebhookRouter() {
  const r = Router();
  r.post('/', (req, res) => {
    const env = getEnv();
    const stripe = getStripe();
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return res.status(200).end();
    let event: Stripe.Event;
    try {
      const signature = req.header('stripe-signature')!;
      event = stripe.webhooks.constructEvent((req as any).rawBody || (req as any).body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as any).message}`);
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'checkout.session.completed') {
      // Best-effort: set plan=premium on subscription active
      const data: any = event.data.object as any;
      const customerId = data.customer || data.customer_id;
      if (customerId) {
        UserModel.findOneAndUpdate({ stripeCustomerId: customerId }, { $set: { plan: 'premium' } }).exec();
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const data: any = event.data.object as any;
      const customerId = data.customer;
      if (customerId) {
        UserModel.findOneAndUpdate({ stripeCustomerId: customerId }, { $set: { plan: 'free' } }).exec();
      }
    }

    res.json({ received: true });
  });
  return r;
}

export function stripeRouter() {
  const r = Router();

  r.post('/stripe/portal', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const stripe = getStripe();
      if (!stripe) return res.status(501).json({ error: 'Stripe not configured' });
      const user = await UserModel.findOne({ uid: (req as any).userId });
      const customerId = user?.stripeCustomerId || await ensureStripeCustomerForUid((req as any).userId!, user?.email);
      const returnUrl = (req.headers.origin as string) || 'http://localhost:3000/settings';
      const session = await stripe.billingPortal.sessions.create({ customer: customerId!, return_url: returnUrl });
      res.json({ url: session.url });
    } catch (err) { next(err); }
  });

  r.post('/stripe/checkout', authMiddleware(), async (req: AuthedRequest, res, next) => {
    try {
      const stripe = getStripe();
      if (!stripe) return res.status(501).json({ error: 'Stripe not configured' });
      const { priceId } = req.body as { priceId?: string };
      if (!priceId) return res.status(400).json({ error: 'priceId required' });
      const user = await UserModel.findOne({ uid: (req as any).userId });
      const customerId = user?.stripeCustomerId || await ensureStripeCustomerForUid((req as any).userId!, user?.email);
      const origin = (req.headers.origin as string) || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId!,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/settings?checkout=success`,
        cancel_url: `${origin}/settings?checkout=cancel`,
      });
      res.json({ url: session.url });
    } catch (err) { next(err); }
  });

  return r;
}
