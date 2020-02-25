# Initialize MongoDB

* [Adding common pages](#adding-common-pages)
* [Adding a User](#adding-a-user)
* [Setting up a mail server](#setting-up-a-mail-server)
* [Settings](#settings)
* [Create indexes](#create-indexes)

Open `mongo` shell and execute scripts.

## Adding common pages

```js
db.pages.insertMany([
  {slug: '', meta_title: 'Home', enabled: true, is_system: true},
  {slug: 'checkout', meta_title: 'Checkout', enabled: true, is_system: true},
  {slug: 'checkout-success', meta_title: 'Thank You!', enabled: true, is_system: true},
  {slug: 'cart', meta_title: 'Cart', enabled: true, is_system: true},
  {slug: 'login', meta_title: 'Login', enabled: true, is_system: true},
  {slug: 'logout', meta_title: 'Logout', enabled: true, is_system: true},
  {slug: 'register', meta_title: 'Register', enabled: true, is_system: true},
  {slug: 'email-confirm', meta_title: 'Email Confirmation', enabled: true, is_system: true},
  {slug: 'user-account', meta_title: 'Your Account', enabled: true, is_system: true},
  {slug: 'account/orders', meta_title: 'Your Orders', enabled: true, is_system: true},
  {slug: 'account/userInfo', meta_title: 'Your Profile', enabled: true, is_system: true},
  {slug: 'account/addresses', meta_title: 'Your Addresses', enabled: true, is_system: true},
  {slug: 'account/payments', meta_title: 'Your Payments', enabled: true, is_system: true},
  {slug: 'products/review-your-purchases', meta_title: 'Review Your Purchases', enabled: true, is_system: true},
  {slug: 'products/review-success', meta_title: 'Review Success', enabled: true, is_system: true},
  {slug: 'about-our-company', meta_title: 'About Our Company', enabled: true, is_system: false},
  {slug: 'terms-of-service', meta_title: 'Terms of Service', enabled: true, is_system: false},
  {slug: 'shipping-policy', meta_title: 'Shipping Policy', enabled: true, is_system: false},
  {slug: 'return-policy', meta_title: 'Return Policy', enabled: true, is_system: false}
]);
```

## Adding a User

```js
db.tokens.insert({
  is_revoked: false,
  date_created: new Date(),
  expiration: 720,
  name: 'admin',
  email: 'admin@chakirlinen.com',
  scopes: ['admin']  
});
```

## Setting up a mail server

```js
db.emailSettings.insert({
  host: 'smtp.sendgrid.net',
  port: 465,
  user: 'apikey',
  pass: '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',
  from_name: 'Admin',
  from_address: 'admin@chakirlinen.com'
});
```

## Settings

```js
db.settings.insert({
  domain: 'http://localhost:3000',
  logo_file: 'logo.png',
  language: 'en',
  currency_code: 'USD',
  currency_symbol: '$',
  currency_format: '${amount}',
  thousand_separator: ',',
  decimal_separator: '.',
  decimal_number: 2,
  timezone: 'US/Pacific',
  date_format: 'MMMM D, YYYY',
  time_format: 'h:mm a',
  default_shipping_country: 'US',
  default_shipping_state: '',
  default_shipping_city: '',
  default_product_sorting: 'stock_status,price,position',
  weight_unit: 'lb',
  length_unit: 'in',
  hide_billing_address: false
});
```

## Create indexes

```js
db.pages.createIndex({ enabled: 1 });
db.pages.createIndex({ slug: 1 });
db.productCategories.createIndex({ enabled: 1 });
db.productCategories.createIndex({ slug: 1 });
db.products.createIndex({ slug: 1 });
db.products.createIndex({ enabled: 1 });
db.products.createIndex({ category_id: 1 });
db.products.createIndex({ sku: 1 });
db.products.createIndex({'attributes.name' : 1, 'attributes.value' : 1});
db.products.createIndex({
  'name': 'text',
  'description': 'text'
}, { default_language: 'english', name: 'textIndex' });
db.users.createIndex({ group_id: 1 });
db.users.createIndex({ email: 1 });
db.users.createIndex({ mobile: 1 });
db.users.createIndex({
  'firstName': 'text',
  'lastName': 'text',
  'shipping_addresses.address1': 'text'
}, { default_language: 'english', name: 'textIndex' });
db.orders.createIndex({ draft: 1 });
db.orders.createIndex({ number: 1 });
db.orders.createIndex({ user_id: 1 });
db.orders.createIndex({ email: 1 });
db.orders.createIndex({ mobile: 1 });
db.orders.createIndex({
  'shipping_address.full_name': 'text',
  'shipping_address.address1': 'text'
}, { default_language: 'english', name: 'textIndex' });
```
