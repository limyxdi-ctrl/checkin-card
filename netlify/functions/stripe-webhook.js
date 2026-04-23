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
  } catch (err) {
    console.error('❌ Signature failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  console.log('✅ Event received:', stripeEvent.type);

  // 👉 HIER passiert die Magie
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    const email = session.customer_details?.email;
    const amount = session.amount_total / 100;

    console.log('💾 NEW PAYMENT:');
    console.log({
      email: email,
      amount: amount,
      date: new Date().toISOString(),
      subscription: session.subscription,
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
