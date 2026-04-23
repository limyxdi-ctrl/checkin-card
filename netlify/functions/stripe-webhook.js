const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    console.log("📩 Event:", body.type);

    // 👇 HIER passiert alles Wichtige
    if (body.type === "checkout.session.completed") {
      const session = body.data.object;

      console.log("💰 Zahlung erfolgreich!");
      console.log("📧 Email:", session.customer_details.email);
      console.log("💵 Betrag:", session.amount_total / 100, "EUR");
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
