const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log('Stripe event received:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {

      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const customerId = session.customer;
        const email = session.customer_email || session.customer_details?.email;
        if (email && customerId) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              email,
              stripe_customer_id: customerId,
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });
          if (error) { console.error('Supabase error:', error); return { statusCode: 500, body: JSON.stringify({ error: error.message }) }; }
          console.log('✅ Profile saved:', email);
        }
        break;
      }

      case 'customer.subscription.created': {
        const sub = stripeEvent.data.object;
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer);
        if (error) console.error('Supabase error:', error);
        else console.log('✅ Subscription activated:', sub.customer);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object;
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer);
        if (error) console.error('Supabase error:', error);
        else console.log('✅ Subscription canceled:', sub.customer);
        break;
      }

      default:
        console.log('Unhandled event:', stripeEvent.type);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };

  } catch (err) {
    console.error('Handler error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
