const Stripe = require("stripe");

exports.config = {
  bodyParser: false,
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

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
    console.log("💰 Payment successful");
  }

  return {
    statusCode: 200,
    body: "ok",
  };
};
