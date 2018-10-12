// config used by server side only

// const dbHost = process.env.DB_HOST || '127.0.0.1';
// const dbPort = process.env.DB_PORT || 27017;
// const dbName = process.env.DB_NAME || 'shop'
// const dbUser = process.env.DB_USER || '';
// const dbPass = process.env.DB_PASS || '';

const dbHost = process.env.DB_HOST || 'ds121183.mlab.com';
const dbPort = process.env.DB_PORT || 21183;
const dbName = process.env.DB_NAME || 'chakir-linen'
const dbUser = process.env.DB_USER || 'chakirlinen';
const dbPass = process.env.DB_PASS || 'chakirlinen123';

const dbCred = dbUser.length > 0 || dbPass.length > 0 ? `${dbUser}:${dbPass}@` : '';
const dbUrl = `mongodb://${dbCred}${dbHost}:${dbPort}/${dbName}`;

const URL = 'http://34.209.139.108';
//const URL = 'http://localhost'

module.exports = {
  // used by Store (server side)
  apiBaseUrl: `${URL}:3001/api/v1`,

  // used by Store (server and client side)
  ajaxBaseUrl: `${URL}:3001/ajax`,

  // Access-Control-Allow-Origin
  storeBaseUrl: `${URL}`,

  // used by API
  adminLoginUrl: '/admin/login',

  apiListenPort: 3001,
  storeListenPort: 3000,

  // used by API
  mongodbServerUrl: dbUrl,

  smtpServer: {
    host: '',
    port: 0,
    secure: true,
    user: '',
    pass: '',
    fromName: '',
    fromAddress: ''
  },

  // key to sign tokens
  jwtSecretKey: 'ecommerce123',

  // key to sign store cookies
  cookieSecretKey: 'ecommerce123',

  // path to uploads
  categoriesUploadPath: 'public/content/images/categories',
  productsUploadPath: 'public/content/images/products',
  filesUploadPath: 'public/content',
  themeAssetsUploadPath: 'theme/assets/images',

  // url to uploads
  categoriesUploadUrl: '/images/categories',
  productsUploadUrl: '/images/products',
  filesUploadUrl: '',
  themeAssetsUploadUrl: '/assets/images',

  // store UI language
  language: 'en',

  // used by API
  orderStartNumber: 1000,

  developerMode: false
}
