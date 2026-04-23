const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig =
    event.headers["stripe-signature"] ||
    event.headers["Stripe-Signature"];

  // 🔥 CRITICAL FIX: RAW STRING, NICHT Buffer!
  const rawBody = event.body;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Signature failed:", err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  console.log("✅ Event:", stripeEvent.type);

  if (stripeEvent.type === "checkout.session.completed") {
    console.log("💰 Payment successful!");
  }

  return {
    statusCode: 200,
    body: "ok",
  };
};
