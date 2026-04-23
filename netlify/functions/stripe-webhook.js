const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    console.log("✅ Event type:", body.type);

    if (body.type === "checkout.session.completed") {
      console.log("💰 PAYMENT SUCCESS");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error("❌ Error:", err.message);

    return {
      statusCode: 400,
      body: "Webhook Error",
    };
  }
};
