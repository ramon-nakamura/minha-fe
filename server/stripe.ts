import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const SPECIAL_CANDLE_PRICE = 199;
export const SPECIAL_CANDLE_CURRENCY = "brl";
