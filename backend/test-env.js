require('dotenv').config({ path: '.env' })

console.log('Testing environment variables:')
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` : 'NOT SET')
console.log('API_BASE_URL:', process.env.API_BASE_URL)
console.log('PORT:', process.env.PORT)
