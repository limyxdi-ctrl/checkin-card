const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig =
    event.headers['stripe-signature'] ||
    event.headers['Stripe-Signature'];

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body, 'utf8');

    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );

    console.log('✅ Event:', stripeEvent.type);

    if (stripeEvent.type === 'checkout.session.completed') {
      console.log('💰 Payment successful');
    }

  } catch (err) {
    console.error('❌ Signature failed:', err.message);

    // 👇 HIER DER TRICK
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
