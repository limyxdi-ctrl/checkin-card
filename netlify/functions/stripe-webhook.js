const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  console.log("=== DEBUG START ===");

  console.log("Headers:", event.headers);
  console.log("IsBase64:", event.isBase64Encoded);
  console.log("Body (raw):", event.body);

  const sig = event.headers["stripe-signature"];

  console.log("Signature:", sig);

  let rawBody;

  if (event.isBase64Encoded) {
    rawBody = Buffer.from(event.body, "base64");
  } else {
    rawBody = event.body;
  }

  console.log("RawBody used:", rawBody);

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ SUCCESS:", stripeEvent.type);

    return {
      statusCode: 200,
      body: "ok",
    };

  } catch (err) {
    console.error("❌ ERROR:", err.message);

    return {
      statusCode: 400,
      body: err.message,
    };
  }
};
