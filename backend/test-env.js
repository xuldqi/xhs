require('dotenv').config();

console.log('Environment Variables Check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_KEY.length + ')' : 'NOT SET');
console.log('ALIPAY_APP_ID:', process.env.ALIPAY_APP_ID || 'NOT SET');
