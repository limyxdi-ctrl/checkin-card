const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig =
    event.headers['stripe-signature'] ||
    event.headers['Stripe-Signature'];

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body);

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('❌ Signature failed:', err.message);

    // 👇 DEBUG (WICHTIG!)
    console.log("BODY:", event.body);
    console.log("BASE64:", event.isBase64Encoded);
    console.log("SIG:", sig);
    console.log("SECRET:", webhookSecret?.substring(0, 10));

    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  console.log('✅ Event:', stripeEvent.type);

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
