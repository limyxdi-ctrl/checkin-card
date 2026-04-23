const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.config = {
  bodyParser: false,
};

exports.handler = async (event) => {
  const sig =
    event.headers["stripe-signature"] ||
    event.headers["Stripe-Signature"];

  // 🔥 RAW BODY FIX
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

  // 👉 DEIN EVENT
  if (stripeEvent.type === "checkout.session.completed") {
    console.log("💰 Checkout erfolgreich!");
  }

  if (stripeEvent.type === "invoice.paid") {
    console.log("💳 Rechnung bezahlt!");
  }

  return {
    statusCode: 200,
    body: "ok",
  };
};
