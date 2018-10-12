const express = require('express');
const ajaxRouter = express.Router();
const jwt = require('jsonwebtoken');
const CezerinClient = require('cezerin-client');
const serverSettings = require('./lib/settings');
const axios = require('axios');

const TOKEN_PAYLOAD = {email: 'admin@chakirlinen.com', scopes: ['admin']};
const STORE_ACCESS_TOKEN = jwt.sign(TOKEN_PAYLOAD, serverSettings.jwtSecretKey);

const restApi = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + STORE_ACCESS_TOKEN
    },
    url: serverSettings.apiBaseUrl
};

const api = new CezerinClient({
    apiBaseUrl: serverSettings.apiBaseUrl,
    apiToken: STORE_ACCESS_TOKEN
});

const DEFAULT_CACHE_CONTROL = 'public, max-age=60';
const PRODUCTS_CACHE_CONTROL = 'public, max-age=60';
const PRODUCT_DETAILS_CACHE_CONTROL = 'public, max-age=60';

const getCartCookieOptions = isHttps => ({
     maxAge: 24 * 60 * 60 * 1000, // 24 hours
     httpOnly: true,
     signed: true,
     secure: true,
     sameSite: 'strict'
})

const getIP = req => {
  let ip = req.get('x-forwarded-for') || req.ip;

  if(ip && ip.includes(', ')) {
    ip = ip.split(', ')[0];
  }

  if(ip && ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
}

const getUserAgent = req => {
  return req.get('user-agent');
}

const getVariantFromProduct = (product, variantId) => {
    if(product.variants && product.variants.length > 0) {
        return product.variants.find(variant => variant.id.toString() === variantId.toString());
    } else {
        return null;
    }
}

const fillCartItemWithProductData = (products, cartItem) => {
    const product = products.find(p => p.id === cartItem.product_id);
    if(product) {
        //cartItem.image_url = product.images.length > 0 ? product.images[0].url : null;
        //cartItem.path = product.path;
        cartItem.stock_backorder = product.stock_backorder;
        cartItem.stock_preorder = product.stock_preorder;
        if(cartItem.variant_id && cartItem.variant_id.length > 0) {
            const variant = getVariantFromProduct(product, cartItem.variant_id);
            cartItem.stock_quantity = variant ? variant.stock_quantity : 0;
        } else {
            cartItem.stock_quantity = product.stock_quantity;
        }
    }
    return cartItem;
}

const fillCartItems = (cartResponse) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + STORE_ACCESS_TOKEN
    }
    let cart = cartResponse.data;
    if(cart && cart.items && cart.items.length > 0) {
        const productIds = cart.items.map(item => item.product_id);
        const productFilter = { ids: productIds, fields: 'images,enabled,stock_quantity,variants,path,stock_backorder,stock_preorder' };
        const query = Object.keys(productFilter).map(key => key + '=' + productFilter[key]).join('&');
        return axios.get(restApi.url + "/products?" + query, { headers: restApi.headers})
                  .then(response => {
                        const newCartItem = cart.items.map(cartItem => fillCartItemWithProductData(response.data.data, cartItem));
                        cartResponse.data.items = newCartItem;
                        return cartResponse;
                  })
                  .catch(error => { console.log(error.response) })
    } else {
      return Promise.resolve(cartResponse)
    }
}

const addCurrentOrder = (user_id, order_id, headers) => {
    return axios.put(restApi.url + "/users/" + user_id + "/addCurrentOrder", { order_id: order_id }, { headers: restApi.headers })
            .then(response => response.status === 200 ? response.status : undefined)
            .catch(error => { console.log(error.response) })
}

const getCurrentOrder = (userId, headers) => {
    return axios.get(restApi.url + "/users/" + userId + "/getCurrentOrder", { headers: restApi.headers })
            .then(response => response.data)
            .catch(error => { console.log(error.response) })
}

ajaxRouter.get('/products', (req, res, next) => {
    let filter = req.query;
    filter.enabled = true;
    const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    axios.get(restApi.url + "/products?" + query, { headers: restApi.headers })
        .then(response => {
            res.status(response.status).header('Cache-Control', PRODUCTS_CACHE_CONTROL).send(response.data);
        })
        .catch(error => { console.log(error) })
})

ajaxRouter.get('/products/:id', (req, res, next) => {
    axios.get(restApi.url + "/products/" + req.params.id, { headers: restApi.headers })
        .then(response => {
            res.status(response.status).header('Cache-Control', PRODUCTS_CACHE_CONTROL).send(response.data);
        })
        .catch(error => { console.log(error) })
})

// ajaxRouter.get('/cart', (req, res, next) => {
//     const order_id = req.signedCookies.order_id;
//     if (order_id) {
//         axios.get(serverSettings.apiBaseUrl + "/orders/" + order_id, { headers: headers })
//             .then(response => {
//                 return fillCartItems(response);
//             })
//             .then(response => {
//                  response.data.browser = undefined;
//                  res.status(response.status).send(response.data);
//             })
//             .catch(error => { console.log(rror.response) })
//     } else {
//         res.end();
//     }
// })

ajaxRouter.get('/cartById/:order_id', (req, res, next) => {
    const order_id = req.params.order_id;
    if (order_id) {
        axios.get(restApi.url + "/orders/" + order_id, { headers: restApi.headers })
            .then(response => fillCartItems(response))
            .then(response => {
                 response.data.browser = undefined;
                 res.status(response.status).send(response.data);
            })
            .catch(error => { console.log(error.response) })
    } else {
        res.end();
    }
})

ajaxRouter.get('/cart/:user_id', (req, res, next) => {
    const user_id = req.params.user_id;
    if (user_id) {
        getCurrentOrder(user_id).then(orderId => {
            axios.get(restApi.url + "/orders/" + orderId, { headers: restApi.headers })
                .then(response =>  fillCartItems(response))
                .then(response => {
                    response.data.browser = undefined;
                    res.status(response.status).send(response.data);
                })
                .catch(error => { console.log(error.response) })
        })
    } else {
       res.end();
    }

})

ajaxRouter.post('/cart/items', (req, res, next) => {
  const isHttps = req.protocol === 'https';
  const CART_COOKIE_OPTIONS = getCartCookieOptions(isHttps);

  const order_id = req.body.user.currentOrderId ? req.body.user.currentOrderId : req.body.user.order_id;
  const item = req.body.item;
  const user = req.body.user;
  if (order_id) {
      axios.post(restApi.url + "/orders/" + order_id + "/items", item, { headers: restApi.headers })
          .then(response => fillCartItems(response))
          .then(response => { res.status(response.status).send(response.data) })
  } else {
    let orderDraft = {
      draft: true,
      firstName: user.firstName,
      lastName: user.lastName,
      user_id: user.user_id,
      email: user.email,
      mobile: user.mobile,
      referrer_url: req.signedCookies.referrer_url,
      landing_url: req.signedCookies.landing_url,
      browser: {
          ip: getIP(req),
          user_agent: getUserAgent(req)
      },
      shipping_address: {}
    };
    axios.get(restApi.url + "/settings", { headers: restApi.headers })
      .then(response => {
        const storeSettings = response.data;
        orderDraft.shipping_address.country = storeSettings.default_shipping_country;
        orderDraft.shipping_address.state = storeSettings.default_shipping_state;
        orderDraft.shipping_address.city = storeSettings.default_shipping_city;
        return orderDraft;
    }).then(orderDraft => {
        axios.post(restApi.url + "/orders", orderDraft, { headers: restApi.headers }).then(response => {
            const orderId = response.data.id;
            if(user.user_id === ''){
                //res.cookie('order_id', orderId, CART_COOKIE_OPTIONS);
                axios.post(restApi.url + "/orders/" + orderId + "/items", item, { headers: restApi.headers })
                    .then(response => fillCartItems(response))
                    .then(response => { res.status(response.status).send(response.data) })
            }
            else {
                addCurrentOrder(user.user_id, orderId, req.headers).then(data => {
                    axios.post(restApi.url + "/orders/" + orderId + "/items", item, { headers: req.headers })
                            .then(response => fillCartItems(response))
                            .then(response => { res.status(response.status).send(response.data) })
                })
            }
        })
     })
   }
})

ajaxRouter.delete('/cart/items/:order_id/:item_id', (req, res, next) => {
    const order_id = req.params.order_id;
    const item_id = req.params.item_id;
    if (order_id && item_id) {
      api.orders.items.delete(order_id, item_id).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
          res.status(status).send(json);
      })
    } else {
        res.end();
    }
})

ajaxRouter.delete('/cart/items/:item_id', (req, res, next) => {
  const order_id = req.signedCookies.order_id;
  const item_id = req.params.item_id;
  if (order_id && item_id) {
    api.orders.items.delete(order_id, item_id).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/items/:item_id', (req, res, next) => {
  const order_id = req.body.order_id ? req.body.order_id : req.signedCookies.order_id;
  const item_id = req.params.item_id;
  delete req.body.order_id;
  const item = req.body;
  if (order_id && item_id) {
    api.orders.items.update(order_id, item_id, item).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/checkout/:order_id', (req, res, next) => {
  const order_id = req.params.order_id;
  if (order_id) {
    api.orders.checkout(order_id).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.clearCookie('order_id');
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
});

ajaxRouter.put('/cart', (req, res, next) => {
  const order_id = req.body.order_id ? req.body.order_id : req.signedCookies.order_id;
  delete req.body.order_id;
  if (order_id) {
    api.orders.update(order_id, req.body).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/shipping_address', (req, res, next) => {
  const order_id = req.body.order_id ? req.body.order_id : req.signedCookies.order_id;
  if (order_id) {
    api.orders.updateShippingAddress(order_id, req.body.shipping_address).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.put('/cart/billing_address', (req, res, next) => {
  const order_id = req.body.order_id ? req.body.order_id : req.signedCookies.order_id;
  if (order_id) {
    api.orders.updateBillingAddress(order_id, req.body.billing_address).then(cartResponse => fillCartItems(cartResponse)).then(({status, json}) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})

ajaxRouter.post('/payments', (req, res, next) => {
  const order_id = req.body.order.id ? req.body.order.id : req.signedCookies.order_id;
  if (order_id) {
    let client = api.orders.client;
    client.post('/payments/stripe-elements', req.body)
      .then(orderResponse => {
        return res.status(200).send({ message: 'Payment was processed successfully' })
      })
  } else {
    res.end();
  }

})

ajaxRouter.get('/pages', (req, res, next) => {
    axios.get(restApi.url + "/pages?" + req.query, { headers: restApi.headers })
      .then(response => {
          res.status(response.status).header('Cache-Control', DEFAULT_CACHE_CONTROL).send(response.data);
      })
})

ajaxRouter.get('/pages/:id', (req, res, next) => {
    axios.get(restApi.url + "/pages/" + req.params.id, { headers: restApi.headers })
      .then(response => {
          res.status(response.status).header('Cache-Control', DEFAULT_CACHE_CONTROL).send(response.data);
      })
})

ajaxRouter.get('/sitemap', async (req, res, next) => {
    let result = null;
    let filter = req.query;
    filter.enabled = true;
    const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    const sitemapResponse = await axios.get(restApi.url + "/sitemap?" + query, { headers: restApi.headers });

    if(sitemapResponse.status !== 404 || sitemapResponse.data) {
        result = sitemapResponse.data;
        if(result.type === 'product') {
            const productResponse = await axios.get(restApi.url + "/products/" + result.resource, { headers: restApi.headers });
            result.data = productResponse.data;
        } else if(result.type === 'page') {
            const pageResponse = await axios.get(restApi.url + "/pages/" + result.resource, { headers: restApi.headers });
            result.data = pageResponse.data;
        }
    }
    res.status(sitemapResponse.status).header('Cache-Control', DEFAULT_CACHE_CONTROL).send(result);
})

ajaxRouter.get('/payment_methods', (req, res, next) => {
  const filter = {
    enabled: true
  };
  api.paymentMethods.list().then(({status, json}) => {
    const methods = json.map(item => {
      delete item.conditions;
      return item;
    });

    res.status(status).send(methods);
  })
})

ajaxRouter.get('/shipping_methods', (req, res, next) => {
  const filter = {
    enabled: true
  };
  api.shippingMethods.list().then(({status, json}) => {
    res.status(status).send(json);
  })
})

ajaxRouter.get('/payment_form_settings/:order_id', (req, res, next) => {
  const order_id = req.params.order_id;
  if (order_id) {
    api.orders.getPaymentFormSettings(order_id).then(({ status, json }) => {
      res.status(status).send(json);
    })
  } else {
    res.end();
  }
})


ajaxRouter.get('/user_groups', (req, res, next) => {
    axios.get(restApi.url + "/user_groups", { headers: restApi.headers })
      .then(response => { res.status(response.status).send(response.data) })
      .catch(error => { console.log(error) })
})


module.exports = ajaxRouter;
