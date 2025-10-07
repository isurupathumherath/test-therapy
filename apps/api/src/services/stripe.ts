import Stripe from 'stripe';
import { getEnv } from '../config/env.js';
import { UserModel } from '../models/User.js';

export function getStripe(): Stripe | null {
  const { STRIPE_SECRET_KEY } = getEnv();
  if (!STRIPE_SECRET_KEY) return null;
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
}

export async function ensureStripeCustomerForUid(uid: string, email?: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const user = await UserModel.findOne({ uid });
  if (user?.stripeCustomerId) return user.stripeCustomerId;
  const customer = await stripe.customers.create({ email, metadata: { uid } });
  if (user) {
    user.stripeCustomerId = customer.id;
    await user.save();
  }
  return customer.id;
}
