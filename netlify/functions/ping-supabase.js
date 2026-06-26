const https = require('https');

exports.handler = async function() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'qllabgoefzwtwielzror.supabase.co',
      path: '/rest/v1/guides?select=id&limit=1',
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('Supabase status:', res.statusCode);
      resolve({ statusCode: 200, body: 'Pinged: ' + res.statusCode });
    });
    
    req.on('error', (e) => {
      resolve({ statusCode: 500, body: 'Error: ' + e.message });
    });
    
    req.end();
  });
};
