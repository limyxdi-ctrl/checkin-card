const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig =
    event.headers["stripe-signature"] ||
    event.headers["Stripe-Signature"];

  // 🔥 WICHTIG: RAW BODY RICHTIG LESEN
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body, "utf8");

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

  if (stripeEvent.type === "invoice.paid") {
    console.log("🧾 Invoice paid!");
  }

  return {
    statusCode: 200,
    body: "ok",
  };
};
