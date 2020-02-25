// config used by dashboard client side only
//const URL = 'http://34.209.139.108';
//const URL = 'http://www.chakirlinen.com'
const URL = 'http://localhost'

module.exports = {
  // dashboard UI language
  language: 'en',
  apiBaseUrl: `${URL}:3001/api/v1`,
  apiWebSocketUrl: 'ws://localhost:3001',
  developerMode: false
}
