import * as t from './actionTypes'
import {PAGE, PRODUCT_CATEGORY, PRODUCT, RESERVED, SEARCH} from './pageTypes'
import queryString from 'query-string'
import { animateScroll } from 'react-scroll'
import api from '../client/api'
//import restApi from '../client/restApi'
import serverSettings from '../../../config/server'
import storeSettings from '../../../config/store'
import countries from './components/countries'
import * as analytics from './analytics'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const restApi = () => {
    const TOKEN_PAYLOAD = {email: 'admin@chakirhospitality.com', scopes: ['admin']};
    const STORE_ACCESS_TOKEN = localStorage.getItem('token') || jwt.sign(TOKEN_PAYLOAD, serverSettings.jwtSecretKey);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + STORE_ACCESS_TOKEN
        },
        url: storeSettings.apiBaseUrl
    }
}

const updateShippingPrice = data => ({type: t.UPDATE_PRICE, data})
const requestProduct = () => ({type: t.PRODUCT_REQUEST})
const receiveProduct = product => ({type: t.PRODUCT_RECEIVE, product})
const requestProducts = () => ({type: t.PRODUCTS_REQUEST})
const receiveProducts = (products) => ({type: t.PRODUCTS_RECEIVE, products})
const requestMoreProducts = () => ({type: t.MORE_PRODUCTS_REQUEST})
const receiveMoreProducts = products => ({type: t.MORE_PRODUCTS_RECEIVE, products})
const requestPage = () => ({type: t.PAGE_REQUEST})
const receivePage = pageDetails => ({type: t.PAGE_RECEIVE, pageDetails})
const requestCart = () => ({type: t.CART_REQUEST})
const receiveCart = cart => ({type: t.CART_RECEIVE, cart})
const requestAddCartItem = () => ({type: t.CART_ITEM_ADD_REQUEST})
const requestUpdateCartItemQuantity = () => ({type: t.CART_ITEM_UPDATE_REQUEST})
const requestDeleteCartItem = () => ({type: t.CART_ITEM_DELETE_REQUEST})
const requestPaymentMethods = () => ({type: t.PAYMENT_METHODS_REQUEST})
const receivePaymentMethods = methods => ({type: t.PAYMENT_METHODS_RECEIVE, methods})
const requestShippingMethods = () => ({type: t.SHIPPING_METHODS_REQUEST})
const receiveShippingMethods = methods => ({type : t.SHIPPING_METHODS_RECEIVE, methods})
const requestCheckout = () => ({type: t.CHECKOUT_REQUEST})
const receiveCheckout = order => ({type: t.CHECKOUT_RECEIVE, order})
const setCurrentCategory = category => ({type: t.SET_CURRENT_CATEGORY, category})
const setProductsFilter = filter => ({type: t.SET_PRODUCTS_FILTER, filter: filter})

export const receiveSitemap = currentPage => ({type: t.SITEMAP_RECEIVE, currentPage})
export const setCurrentLocation = location => ({type: t.LOCATION_CHANGED, location})
export const hideDeal = () => ({type: t.HIDE_DEAL})
export const hideQuantity = () => ({type: t.HIDE_QUANTITY});
export const showQuantity = () => ({type: t.SHOW_QUANTITY});
export const editShippingAddress = id  => ({type: t.EDIT_ADDRESS, payload: id})
export const reviewProduct = item => ({type: t.REVIEW_PRODUCT, payload: item})

const eraseCookie = (name) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const getCurrentOrder = (user_id) => {
    return axios.get(restApi().url + "/users/" + user_id + "/getCurrentOrder", { headers: restApi().headers })
            .then(response => response.data)
            .catch(error => { console.log(error.response) })
}

const addCurrentOrder = (userId, orderId) => {
    return axios.put(restApi().url + "/users/" + userId + "/addCurrentOrder/" + orderId, { headers: restApi().headers })
            .then(response => response.data)
            .catch(error => { console.log(error.response) })
}


export const createAccount = (user, history) => (dispatch, getState) => {
    dispatch({ type: t.USER_CREATE_STARTED });
    return axios.post(storeSettings.apiBaseUrl + "/users/create", user)
            .then(response => {
                dispatch({ type: t.USER_CREATE_FULFILLED });
                history.push("/create-success/" + user.customerType);
            })
            .catch(error => { dispatch({ type: t.USER_CREATE_REJECTED, payload: error.response.data }) })
}

export const confirmEmail = (data, history) => (dispatch, getState) => {
    return axios.post(storeSettings.apiBaseUrl + "/users/confirmEmail", data)
            .then(response => response.data)
            .catch(error => { console.log(error) })
}

export const login = (user, history) => (dispatch, getState) => {
    const {app} = getState();
    if (app.cart) user.order_id = app.cart.id;
    dispatch({type: t.USER_LOGIN_STARTED});
    return axios.post(storeSettings.apiBaseUrl + "/users/login", user)
            .then(response => {
                dispatch({ type: t.USER_LOGIN_FULFILLED });
                //eraseCookie('order_id');
                localStorage.removeItem('order_id');
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user_id', JSON.stringify(response.data.user.id));
                location.reload();
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: t.USER_LOGIN_REJECTED, payload: error.response.data });
            })
}

export const fetchTokenAndUser = () => (dispatch, getState) => {
     const token = localStorage.getItem('token');
     const user_id = JSON.parse(localStorage.getItem('user_id'));
     if (token && user_id){
         const data = { token, user_id };
         dispatch({type: t.GET_TOKEN_USER, data});
         fetchUserData(user_id);
     }
}

export const fetchUserData = (userId) => (dispatch, getState) => {
    return axios.get(restApi().url + "/users/" + userId, { headers: restApi().headers })
            .then(response => {
                dispatch({ type: t.FILL_USER, payload: response.data });
            })
            .catch(error => { console.log(error) })
}

export const saveUserData = (data) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    dispatch({type: t.USER_UPDATE_STARTED});
    return axios.put(restApi().url + "/users/" + userId, data, { headers: restApi().headers })
            .then(response => {
                dispatch({ type: t.USER_UPDATE_FULFILLED, payload: response.data });
                return response.data;
            })
            .catch(error => {
                dispatch({ type: t.USER_UPDATE_REJECTED, payload: error.response.data });
            })
}

export const changePassword = (data) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    return axios.put(restApi().url + "/users/" + userId + "/changePassword", data, { headers: restApi().headers })
            .then(response => response.data)
            .catch(error => {
                dispatch({ type: t.USER_UPDATE_REJECTED, payload: error.response.data });
            })
}

export const fetchOrders = (id) => (dispatch, getState) => {
    return axios.get(restApi().url + "/orders?paid=true&user_id=" + id, { headers: restApi().headers })
            .then(response => { dispatch({ type: t.FILL_ORDERS, payload: response.data }) })
            .catch(error => { console.log(error) })
}

export const fetchShippingAddress = (userId) => (dispatch, getState) => {
    return axios.get(restApi().url + "/users/" + userId + "/shipping_address", { headers: restApi().headers })
            .then(response => { dispatch({ type: t.FILL_ADDRESSES, payload: response.data }) })
            .catch(error => { console.log(error) })
}

export const addShippingAddress = (address, history) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;

    return axios.post(restApi().url + "/users/" + userId + "/shipping_address", address, { headers: restApi().headers })
            .then(response => { location.reload() })
            .catch(error => { console.log(error) })
}

export const updateShippingAddress = (address, history) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    const addressId = app.editAddress.id;
    return axios.put(restApi().url + "/users/" + userId + "/shipping_address/" + addressId, address, { headers: restApi().headers })
            .then(response => { location.reload() })
            .catch(error => { console.log(error) })
}

export const deleteShippingAddress = (addressId, history) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    return axios.delete(restApi().url + "/users/" + userId + "/shipping_address/" + addressId, { headers: restApi().headers })
            .then(response => { dispatch({ type: t.DELETE_ADDRESS, payload: addressId }) })
            .catch(error => { console.log(error) })
}

export const setDefaultShipping = (addressId, history) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    return axios.post(restApi().url + "/users/" + userId + "/shipping_address/" + addressId + "/default_shipping", { headers: restApi().headers })
            .then(response => { location.reload() })
            .catch(error => { console.log(error) })
}

export const addReview = (data, history) => (dispatch, getState) => {
    const {app} = getState();
    const userId = app.userInfo.id;
    const full_name = app.user.firstName + " " + app.user.lastName;
    const review = {
        user_id: userId,
        title: data.title,
        content: data.content,
        star: data.star,
        full_name: full_name
    }
    //console.log(review);
    return axios.put(restApi().url + "products/" + data.productId + "/addReview", review, { headers: restApi().headers })
            .then(response => response.data)
            .catch(error => { console.log(error) })
}

export const addCartItem = item => (dispatch, getState) => {
    const {app} = getState();
    if (app.userInfo){
        const order_id = app.cart ? app.cart.id : null;
        const user = {
            user_id : app.userInfo.id,
            firstName : app.userInfo.firstName,
            lastName : app.userInfo.lastName,
            email : app.userInfo.email,
            mobile : app.userInfo.mobile,
            currentOrderId: order_id
        }
        dispatch(requestAddCartItem());
        return axios.post(storeSettings.ajaxBaseUrl + "/cart/items", {item, user}, { headers: restApi().headers })
                      .then(response => {
                          dispatch(receiveCart(response.data))
                          analytics.addCartItem({
                              item: item,
                              cart: response.data
                          });
                      })
                      .catch(error => { console.log(error) })
    }
    else {
       const order_id = localStorage.getItem('order_id');
       const user = { user_id : '', firstName : '', lastName : '', email : '', mobile : '', order_id: order_id };
       dispatch(requestAddCartItem());
       return axios.post(storeSettings.ajaxBaseUrl + "/cart/items", {item, user})
                     .then(response => {
                         dispatch(receiveCart(response.data));
                         analytics.addCartItem({
                             item: item,
                             cart: response.data
                         });
                         if (!order_id){
                            localStorage.setItem('order_id', response.data.id);
                         }
                     })
                     .catch(error => { console.log(error) })
     }
}

export const fetchCart = (user_id, history) => (dispatch, getState) => {
    dispatch(requestCart());
    if (user_id){
        getCurrentOrder(user_id).then(orderId => {
            return axios.get(restApi().url + "/orders/" + orderId, { headers: restApi().headers })
                      .then(response =>  fillCartItems(response))
                      .then(response => {
                          response.data.browser = undefined;
                          dispatch(receiveCart(response.data));
                      })
                      .catch(error => { console.log(error) })
            })
    }
}

export const fetchCartById = (order_id, history) => (dispatch, getState) => {
    dispatch(requestCart());
    if (order_id){
        return axios.get(restApi().url + "/orders/" + order_id, { headers: restApi().headers })
                  .then(response => fillCartItems(response))
                  .then(response => {
                       response.data.browser = undefined;
                       dispatch(receiveCart(response.data));
                  })
                  .catch(error => { console.log(error) })
        }
}

export const fetchProducts = () => (dispatch, getState) => {
    const {app} = getState();
    dispatch(requestProducts());
    let filter = getParsedProductFilter(app.productFilter);
    filter.enabled = true;
    const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    return axios.get(restApi().url + "/products?" + query, { headers: restApi().headers })
              .then(response => {
                  dispatch(receiveProducts(null));
                  dispatch(receiveProducts(response.data));
              })
              .catch(error => { console.log(error) })
}

export const getProductFilterForCategory = (locationSearch, sortBy) => {
    const queryFilter = queryString.parse(locationSearch);
    let attributes = {};

    for(const querykey in queryFilter){
        if(querykey.startsWith('attributes.')){
            attributes[querykey] = queryFilter[querykey];
        }
    }

    return {
        priceFrom: parseInt(queryFilter.price_from || 0),
        priceTo: parseInt(queryFilter.price_to || 0),
        attributes: attributes,
        search: null,
        sort: sortBy
    }
}

export const getProductFilterForSearch = (locationSearch) => {
    const queryFilter = queryString.parse(locationSearch);

    return {
        categoryId: null,
        priceFrom: parseInt(queryFilter.price_from || 0),
        priceTo: parseInt(queryFilter.price_to || 0),
        search: queryFilter.search,
        sort: 'search'
    }
}


export const getParsedProductFilter = (productFilter) => {
    const filter = Object.assign({},
      {
          on_sale: productFilter.onSale,
          search: productFilter.search,
          category_id: productFilter.categoryId,
          price_from: productFilter.priceFrom,
          price_to: productFilter.priceTo,
          sort: productFilter['sort'],
          fields: productFilter['fields'],
          limit: productFilter['limit'],
          offset: 0
      },
      productFilter.attributes
    )

    return filter;
}

export const fetchMoreProducts = () => (dispatch, getState) => {
    const {app} = getState();
    if (app.loadingProducts || app.loadingMoreProducts || app.products.length === 0 || !app.productsHasMore) {
        return Promise.resolve();
    } else {
        dispatch(requestMoreProducts());
        let filter = getParsedProductFilter(app.productFilter);
        filter.offset = app.products.length;
        const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
        return axios.get(restApi().url + "/products?" + query, { headers: restApi().headers })
                  .then(response => {
                      dispatch(receiveMoreProducts(response.data));
                      animateScroll.scrollMore(200);
                  })
                  .catch(error => { console.log(error) })
    }
}

export const updateCartItemQuantity = (item_id, quantity) => (dispatch, getState) => {
    const {app} = getState();
    dispatch(requestUpdateCartItemQuantity());
    const order_id = app.cart ? app.cart.id : null;

    if (order_id && item_id){
        return axios.put(restApi().url + "/orders/" + order_id + "/items/" + item_id, { quantity: quantity }, { headers: restApi().headers })
                  .then(response => {
                      if (response.data === true){
                          localStorage.removeItem('order_id');
                          history.push('/');
                      }
                      return fillCartItems(response)
                  })
                  .then(response => {
                      dispatch(receiveCart(response.data));
                      dispatch(fetchShippingMethods());
                  })
                  .catch(error => { console.log(error) })
    }
}

export const deleteCartItem = item_id => (dispatch, getState) => {
    dispatch(requestDeleteCartItem())
    const {app} = getState();
    const order_id = app.cart ? app.cart.id : null;

    if (order_id && item_id){
        return axios.delete(restApi().url + "/orders/" + order_id + "/items/" + item_id, { headers: restApi().headers})
                .then(response => {
                    if (response.data === true){
                        localStorage.removeItem('order_id');
                    }
                    dispatch(receiveCart(response.data));
                    analytics.deleteCartItem({
                        itemId: item_id,
                        cart: app.cart
                    });
                    return response.data;
                })
                .catch(error => { console.log(error) })
    }
}

export const fetchPaymentMethods = () => (dispatch, getState) => {
    dispatch(requestPaymentMethods());
    return axios.get(restApi().url + "/payment_methods?enabled=true", { headers: restApi().headers })
              .then(response => { dispatch(receivePaymentMethods(response.data)) })
              .catch(error => { console.log(error) })
}

export const fetchShippingMethods = () => (dispatch, getState) => {
    dispatch(requestShippingMethods())
    return axios.get(restApi().url + "/shipping_methods?enabled=true", { headers: restApi().headers })
              .then(response => { dispatch(receiveShippingMethods(response.data)) })
              .catch(error => { console.log(error) })
}

export const checkoutStripe = (token, history) => (dispatch, getState) => {
  const {app} = getState();
  const order_id = app.cart ? app.cart.id : null;

  return axios.put(restApi().url + "/orders/" + order_id, { payment_token: token }, { headers: restApi().headers })
        .then(response => {
            const total = Number(response.data.order_total.toFixed(Math.max(0, ~~ 2)));
            const payment = {
                amount: total,
                statement: "Order #" + response.data.number,
                currency: 'usd',
                order: {
                    id: response.data.id
                },
                stripeToken: {
                    id: token.id
                }
             };
             return axios.post(restApi().url + "/payments/stripe-elements", payment, { headers: restApi().headers })
      })
      .then(response =>  axios.put(restApi().url + "/orders/" + order_id + "/checkout", {}, { headers: restApi().headers }))
      .then(response => {
          dispatch(receiveCheckout(response.data));
          localStorage.removeItem('order_id');
          return sendOrderToShipStation(response.data, app.shippingMethods);
      })
      .then(data => {
          history.push('/checkout-success');
          analytics.checkoutSuccess({ order: order });
      })
      .catch(error => { console.log(error) })
}

export const checkout = (cart, history) => (dispatch, getState) => {
  dispatch(requestCheckout())
  if(cart){
    // update cart and checkout
    return api.ajax.cart.updateShippingAddress({shipping_address: cart.shipping_address, order_id: cart.id})
      .then(() => api.ajax.cart.updateBillingAddress({billing_address: cart.billing_address, order_id: cart.id}))
      .then(() => api.ajax.cart.update({
        email: cart.email,
        mobile: cart.mobile,
        payment_method_id: cart.payment_method_id,
        shipping_method_id: cart.shipping_method_id,
        comments: cart.comments,
        order_id: cart.id
      }))
      .then(() => api.ajax.cart.checkout())
      .then(orderResponse => {
        dispatch(receiveCheckout(orderResponse.json))
        history.push('/checkout-success');
        analytics.checkoutSuccess({ order: orderResponse.json });
      })
      .catch(error => {});
  } else {
    // just checkout
    return api.ajax.cart.checkout()
      .then(orderResponse => {
        dispatch(receiveCheckout(orderResponse.json))
        history.push('/checkout-success');
        analytics.checkoutSuccess({ order: orderResponse.json });
      })
      .catch(error => {});
  }
}

export const setCategory = categoryId => (dispatch, getState) => {
    const {app} = getState();
    const category = app.categories.find(c => c.id === categoryId);
    if (category) {
        dispatch(setCurrentCategory(category));
        dispatch(setProductsFilter({categoryId: categoryId}));
        dispatch(receiveProduct(null));
    }
}

export const setSort = sort => (dispatch, getState) => {
    dispatch(setProductsFilter({sort: sort}));
    dispatch(fetchProducts());
}

export const updateCartShippingMethod = (method_id, shipping_price) => (dispatch, getState) => {
  const {app} = getState();
  const order_id = app.cart ? app.cart.id : null;
  axios.put(restApi().url + "/orders/" + order_id, { shipping_method_id: method_id, shipping_price: shipping_price }, { headers: restApi().headers })
      .then(response => fillCartItems(response))
      .then(response => { dispatch(receiveCart(response.data)) })
      .catch(error => { console.log(error) })
}

export const updateCartPaymentMethod = method_id => (dispatch, getState) => {
  const {app} = getState();
  const order_id = app.cart ? app.cart.id : null;
  axios.put(restApi().url + "/orders/" + order_id, { payment_method_id: method_id }, { headers: restApi().headers })
      .then(response => fillCartItems(response))
      .then(response => { dispatch(receiveCart(response.data)) })
      .catch(error => { console.log(error) })
}

export const analyticsSetShippingMethod = method_id => (dispatch, getState) => {
    const {app} = getState();
    analytics.setShippingMethod({
        methodId: method_id,
        allMethods: app.shippingMethods
    })
}

export const analyticsSetPaymentMethod = method_id => (dispatch, getState) => {
    const {app} = getState();
    analytics.setPaymentMethod({
        methodId: method_id,
        allMethods: app.paymentMethods
    })
}

export const updateCart = cart => (dispatch, getState) => {
    const {app} = getState();
    const order_id = app.cart ? app.cart.id : null;
    return [
        axios.put(restApi().url + "/orders/" + order_id, { email: cart.email,
                                                           mobile: cart.mobile,
                                                           firstName: cart.firstName,
                                                           lastName: cart.lastName }, { headers: restApi().headers })
    ].reduce((p, fn) => p.then(() => fn), Promise.resolve()).then(response => {
        dispatch(receiveCart(response.data));
    })
    .catch(error => { console.log(error) })
}

export const updateShipping = cart => (dispatch, getState) => {
    const {app} = getState();
    const order_id = app.cart ? app.cart.id : null;
    return [
      axios.put(restApi().url + "/orders/" + order_id + "/shipping_address", cart.shipping_address, { headers: restApi().headers }),
      axios.put(restApi().url + "/orders/" + order_id + "/billing_address", cart.billing_address, { headers: restApi().headers }),
      axios.put(restApi().url + "/orders/" + order_id, { comments: cart.comments }, { headers: restApi().headers })
    ].reduce((p, fn) => p.then(() => fn), Promise.resolve()).then(response => {
        dispatch(receiveCart(response.data));
    })
    .catch(error => { console.log(error) })
}

export const setCurrentPage = location => (dispatch, getState) => {
  let locationPathname = '/404';
  let locationSearch = '';
  let locationHash = '';

  if(location){
    locationPathname = location.pathname;
    locationSearch = location.search;
    locationHash = location.hash;
  }

  const {app} = getState();
  let statePathname = '/404';
  let stateSearch = '';
  let stateHash = '';

  if(app.location){
    statePathname = app.location.pathname;
    stateSearch = app.location.search;
    stateHash = app.location.hash;
  }

  const currentPageAlreadyInState = statePathname === locationPathname && stateSearch === locationSearch;

  if(currentPageAlreadyInState) {
    // same page
  } else {
    dispatch(setCurrentLocation({
      hasHistory: true,
      pathname: locationPathname,
      search: locationSearch,
      hash: locationHash
    }));

    const category = app.categories.find(c => c.path === locationPathname);
    if(category){
      const newCurrentPage = {
        type: 'product-category',
        path: category.path,
        resource: category.id
      };
      dispatch(receiveSitemap(newCurrentPage)) // remove .data
      dispatch(fetchDataOnCurrentPageChange(newCurrentPage))
    } else {
      axios.get(storeSettings.ajaxBaseUrl + "/sitemap?path=" + locationPathname)
      .then(sitemapResponse => {
          if(sitemapResponse.status === 404){
            dispatch(receiveSitemap({
              type: 404,
              path: locationPathname,
              resource: null
            }))
          } else {
            const newCurrentPage = sitemapResponse.data;
            dispatch(receiveSitemap(newCurrentPage))
            dispatch(fetchDataOnCurrentPageChange(newCurrentPage))
          }
       });
     }
   }
}

const fetchDataOnCurrentPageChange = currentPage => (dispatch, getState) => {
  const {app} = getState();
  let productFilter = null;

  // clear product data
  dispatch(receiveProduct(null));

  analytics.pageView({
    path: currentPage.path,
    title: '-'
  });

  switch(currentPage.type){
    case PRODUCT_CATEGORY:
      productFilter = getProductFilterForCategory(app.location.search, app.settings.default_product_sorting);
      dispatch(setCategory(currentPage.resource));
      dispatch(setProductsFilter(productFilter));
      dispatch(fetchProducts());
      break;
    case SEARCH:
      productFilter = getProductFilterForSearch(app.location.search);
      dispatch(setProductsFilter(productFilter));
      dispatch(fetchProducts());
      analytics.search({ searchText: productFilter.search });
      break;
    case PRODUCT:
      const productData = currentPage.data;
      dispatch(receiveProduct(productData))
      analytics.productView({ product: productData })
      break;
    case PAGE:
      const pageData = currentPage.data;
      dispatch(receivePage(pageData))
      if(currentPage.path === '/checkout'){
        analytics.checkoutView({ order: app.cart })
      }
      break;
  }
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
    let cart = cartResponse.data;
    if(cart && cart.items && cart.items.length > 0) {
        const productIds = cart.items.map(item => item.product_id);
        const productFilter = { ids: productIds, fields: 'images,enabled,stock_quantity,variants,path,stock_backorder,stock_preorder' };
        const query = Object.keys(productFilter).map(key => key + '=' + productFilter[key]).join('&');
        return axios.get(restApi().url + "/products?" + query, { headers: restApi().headers})
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

const sendOrderToShipStation = (order, shippingMethods) => {

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Authorization': 'Basic YjNjMDYyMjU3ZDFlNGJlMDhlN2I5NjAzNTRlYzJiZTA6ODQwMzc5OWU5NWFmNDZmNDg5ZGZkMzZhOTZlMjdiNjU='
    }

    let shipCountry;
    let billCountry;
    for (const key in countries) {
        if (countries[key] === order.shipping_address.country){
            shipCountry = key;
        }
    }
    for (const key in countries) {
        if (countries[key] === order.billing_address.country){
            billCountry = key;
        }
    }

    let residential = null;
    if (order.shipping_address.residential === 'true') residential = true;
    else if (order.shipping_address.residential === 'false') residential = false;
    else residential = order.shipping_address.residential;

    const shipTo = {
        name: order.shipping_address.full_name,
        street1: order.shipping_address.address1,
        city: order.shipping_address.city,
        state: order.shipping_address.state,
        country: shipCountry,
        postalCode: order.shipping_address.postal_code,
        phone: order.shipping_address.phone,
        residential: residential
    }

    const billTo = {
        name: order.billing_address.full_name,
        street1: order.billing_address.address1,
        city: order.billing_address.city,
        state: order.billing_address.state,
        country: billCountry,
        postalCode: order.billing_address.postal_code,
        phone: order.billing_address.phone
    };

    const items = order.items.map((item,key) => {
        const split = item.variant_name.split(/, |: /);
        const color = split[0] === 'Color' ? split[1] : split[3];
        const size = split[0] === 'Size' ? split[1] : split[3];
        return {
            lineItemKey: item.id,
            sku: item.sku,
            name: item.name,
            imageUrl: item.image_url,
            weight: {
                value: item.weight,
                units: "lb"
            },
            quantity: item.quantity,
            unitPrice: item.price,
            options: [
                {
                   name: "Color",
                   value: color
                },
                {
                    name: "Size",
                    value: size
                }
            ]
        }
    })
    let carrierCode = '';
    let serviceCode = '';
    shippingMethods.forEach(method => {
        if (method.name === order.shipping_method){
            carrierCode = method.carrierCode;
            serviceCode = method.serviceCode;
        }
    })

    const body = {
        orderNumber: order.number.toString(),
        orderDate: order.date_placed,
        paymentDate: order.date_placed,
        orderStatus: "awaiting_shipment",
        customerEmail: order.email,
        shipTo: shipTo,
        billTo: billTo,
        items: items,
        amountPaid: order.order_total,
        taxAmount: order.tax_included_total,
        shippingAmount: order.shipping_total,
        customerNotes: order.comments,
        paymentMethod: order.payment_method,
        carrierCode: carrierCode,
        serviceCode: serviceCode,
        packageCode: "package",
        confirmation: "delivery",
        advancedOptions: {
            storeId: 201365,
            warehouseId: 178654
        }
    }
    //console.log(body);

    return axios.post('https://ssapi.shipstation.com/orders/createorder', body, { headers: headers })
          .then(response => response.data)
          .catch(error =>  {console.log(error) })
}

const getOrdersFromShipStation = () => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Authorization': 'Basic YjNjMDYyMjU3ZDFlNGJlMDhlN2I5NjAzNTRlYzJiZTA6ODQwMzc5OWU5NWFmNDZmNDg5ZGZkMzZhOTZlMjdiNjU='
    }

    return axios.get('https://ssapi.shipstation.com/orders', { headers: headers })
          .then(response => {
              return response.data;
          })
          .then(data => {
              return data;
          })
          .catch(error => {
              console.log(error);
          })

}
