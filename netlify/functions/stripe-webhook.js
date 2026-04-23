const Stripe = require("stripe");

exports.config = {
  bodyParser: false,
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // 👉 Header (beide Varianten abfangen)
  const sig =
    event.headers["Stripe-Signature"] ||
    event.headers["stripe-signature"];

  // 👉 RAW BODY (wichtig für Stripe!)
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

  // 👉 Debug
  console.log("✅ Event received:", stripeEvent.type);

  // 👉 Beispiel: Zahlung erfolgreich
  if (stripeEvent.type === "checkout.session.completed") {
    console.log("💰 Payment successful");
  }

  // 👉 Wichtig: Immer 200 zurückgeben
  return {
    statusCode: 200,
    body: "ok",
  };
};
