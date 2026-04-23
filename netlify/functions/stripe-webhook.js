const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : event.body;

    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );

    console.log('✅ SUCCESS:', stripeEvent.type);

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (err) {
    console.error('❌ FAIL:', err.message);

    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};
