import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import axios from 'axios'

function requestOrder() {
  return { type: t.ORDER_DETAIL_REQUEST }
}

function receiveOrder(item) {
  return { type: t.ORDER_DETAIL_RECEIVE, item }
}

export function clearOrderDetails() {
  return receiveOrder(null);
}

function requestOrders() {
  return { type: t.ORDERS_REQUEST }
}

function requestMoreOrders() {
  return { type: t.ORDERS_MORE_REQUEST }
}

function receiveOrdersMore({ has_more, total_count, data }) {
  return { type: t.ORDERS_MORE_RECEIVE, has_more, total_count, data }
}

function receiveOrders({ has_more, total_count, data }) {
  return { type: t.ORDERS_RECEIVE, has_more, total_count, data }
}

function receiveOrdersError(error) {
  return { type: t.ORDERS_FAILURE, error }
}

function requestOrderCheckout() {
  return { type: t.ORDER_CHECKOUT_REQUEST }
}

function receiveOrderCheckout() {
  return { type: t.ORDER_CHECKOUT_RECEIVE }
}

function failOrderCheckout(error) {
  return { type: t.ORDER_CHECKOUT_FAILURE, error }
}

export function selectOrder(id) {
  return { type: t.ORDERS_SELECT, orderId: id }
}

export function deselectOrder(id) {
  return { type: t.ORDERS_DESELECT, orderId: id }
}

export function deselectAllOrder() {
  return { type: t.ORDERS_DESELECT_ALL }
}

export function selectAllOrder() {
  return { type: t.ORDERS_SELECT_ALL }
}

export function setFilter(filter) {
  return { type: t.ORDERS_SET_FILTER, filter: filter }
}

function requestBulkUpdate() {
  return { type: t.ORDERS_BULK_UPDATE_REQUEST }
}

function receiveBulkUpdate() {
  return { type: t.ORDERS_BULK_UPDATE_SUCCESS }
}

function errorBilkUpdate() {
  return { type: t.ORDERS_BULK_UPDATE_FAILURE }
}

function deleteOrdersSuccess() {
  return { type: t.ORDER_DELETE_SUCCESS }
}

function createOrdersSuccess() {
  return { type: t.ORDER_CREATE_SUCCESS }
}

function requestOrderUpdate() {
  return { type: t.ORDER_UPDATE_REQUEST }
}

function receiveOrderUpdate() {
  return { type: t.ORDER_UPDATE_SUCCESS }
}

function failOrderUpdate(error) {
  return { type: t.ORDER_UPDATE_FAILURE, error }
}

const getFilter = (state, offset = 0) => {
  const filterState = state.orders.filter;
  let filter = {
    limit: 50,
    offset: offset
  }

  if(filterState.search !== null && filterState.search !== ''){
    filter.search = filterState.search;
  }

  if(filterState.closed !== null){
    filter.closed = filterState.closed;
  }

  if(filterState.cancelled !== null){
    filter.cancelled = filterState.cancelled;
  }

  if(filterState.delivered !== null){
    filter.delivered = filterState.delivered;
  }

  if(filterState.paid !== null){
    filter.paid = filterState.paid;
  }

  if(filterState.hold !== null){
    filter.hold = filterState.hold;
  }

  if(filterState.draft !== null){
    filter.draft = filterState.draft;
  }

  if(state.orderStatuses.selectedId) {
    filter.status_id = state.orderStatuses.selectedId;
  }

  return filter;
}

export function fetchOrders() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.orders.loadingItems) {
            dispatch(requestOrders());
            dispatch(deselectAllOrder());

            const filter = getFilter(state);
            const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
            return axios.get(restApi.url + "/orders?" + query, { headers: restApi.headers })
                          .then(response => { dispatch(receiveOrders(response.data)) })
                          .catch(error => { dispatch(receiveOrdersError(error)) })
                }
        }
}

export function fetchMoreOrders() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.orders.loadingItems) {
          dispatch(requestMoreOrders());

          const filter = getFilter(state, state.orders.items.length);
          const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
          return axios.get(restApi.url + "/orders?" + query, { headers: restApi.headers })
                        .then(response => { dispatch(receiveOrdersMore(response.data)) })
                        .catch(error => { dispatch(receiveOrdersError(error)) })
              }
       }
}

export function bulkUpdate(dataToSet) {
    return (dispatch, getState) => {
        dispatch(requestBulkUpdate());
        const state = getState();
        let promises = state.orders.selected.map(orderId => axios.put(restApi.url + "/orders/" + orderId, dataToSet, { headers: restApi.headers }));

        return Promise.all(promises).then(values => {
            dispatch(receiveBulkUpdate());
            dispatch(fetchOrders());
        }).catch(error => {
            dispatch(errorBilkUpdate());
            console.log(error.response);
        })
    }
}

export function deleteOrders() {
    return (dispatch, getState) => {
        const state = getState();
        let promises = state.orders.selected.map(orderId => axios.delete(restApi.url + "/orders/" + orderId, { headers: restApi.headers }));

        return Promise.all(promises).then(values => {
            dispatch(deleteOrdersSuccess());
            dispatch(deselectAllOrder());
            dispatch(fetchOrders());
        }).catch(error => { console.log(error.response) })
    }
}

export function deleteCurrentOrder() {
    return (dispatch, getState) => {
        const state = getState();
        let order = state.orders.editOrder;

        if(order && order.id) {
            return axios.delete(restApi.url + "/orders/" + order.id, { headers: restApi.headers })
                          .then(response => response.status === 200 && response.status : undefined)
                          .catch(error => { console.log(error.response) })
                  }
        }
}

const fetchOrderAdditionalData = (order) => {
    const hasCustomer = order.user_id && order.user_id.length > 0;
    const hasShippingMethod = order.shipping_method_id && order.shipping_method_id.length > 0;
    const productIds = order && order.items && order.items.length > 0
      ? order.items.filter(item => item.product_id).map(item => item.product_id)
      : [];
    const productFilter = { ids: productIds, fields: 'images,enabled,stock_quantity,variants,options' };
    const query = Object.keys(productFilter).map(key => key + '=' + productFilter[key]).join('&');
    return Promise.all([
        productIds.length > 0 ? axios.get(restApi.url + "/products?" + query, { headers: restApi.headers }) : null,
        hasCustomer ? axios.get(restApi.url + "/users/" + order.user_id, { headers: restApi.headers }) : null,
        hasShippingMethod ? axios.get(restApi.url + "/shipping_methods/" + order.shipping_method_id, { headers: restApi.headers }) : null
    ]).then(([
        productsResponse,
        customerResponse,
        methodResponse
    ]) => {

      if(productsResponse){
          const products = productsResponse.data.data;
          const newItems = order.items.map(item => {
              item.product = products.find(p => p.id === item.product_id);
              return item;
          })
          order.items = newItems;
      }

      order.customer = customerResponse ? customerResponse.data.data : null;
      order.shipping_method_details = methodResponse ? methodResponse.data.data : null;

      return order;
    }).catch(error => { console.log(error.response) })
}

const addCurrentOrder = (userId, orderId) => {
    return axios.put(restApi.url + "/users/" + userId + "/addCurrentOrder/" + orderId, null, { headers: restApi.headers })
            .then(response => response.status)
            .catch(error => { console.log(error.response) })
}

export function fetchOrder(orderId) {
    return (dispatch, getState) => {
        dispatch(requestOrder());
        return axios.get(restApi.url + "/orders/" + orderId, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function deleteOrderItem(orderId, orderItemId){
    return (dispatch, getState) => {
        const state = getState();
        return axios.delete(restApi.url + "/orders/" + orderId + "/items/" + orderItemId, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function addOrderItem(orderId, productId){
    return (dispatch, getState) => {
        const state = getState();
        return axios.post(restApi.url + "/orders/" + orderId + "/items", { product_id: productId, variant_id: null, quantity: 1 }, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function updateOrderItem(orderId, orderItemId, quantity, variantId, itemPrice){
    return (dispatch, getState) => {
        const state = getState();
        return axios.put(restApi.url + "/orders/" + orderId + "/items/" + orderItemId, { quantity: quantity, variant_id: variantId, custom_price: itemPrice }, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
            }
}

export function updateOrder(data) {
    return (dispatch, getState) => {
        dispatch(requestOrderUpdate());
        return axios.put(restApi.url + "/orders/" + data.id, data, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => {
                          dispatch(receiveOrderUpdate());
                          dispatch(receiveOrder(order));
                      })
                      .catch(error => { dispatch(failOrderUpdate(error)) })
              }
}

export function addCustomerForOrder(data) {
    return (dispatch, getState) => {
        //console.log(data.shipping_address);
        dispatch(requestOrderUpdate());
        return [
          addCurrentOrder(data.userInfo.user_id, data.id),
          axios.put(restApi.url + "/orders/" + data.id, data.userInfo, { headers: restApi.headers }),
          axios.put(restApi.url + "/orders/" + data.id + "/shipping_address", data.shipping_address, { headers: restApi.headers })
          //api.orders.updateShippingAddress(data.id, data.shipping_address)
          //api.orders.updateBillingAddress(data.id, data.billing_address)
        ].reduce((p, fn) => p.then(() => fn), Promise.resolve())
        .then(response => response.data)
        .then(fetchOrderAdditionalData)
        .then(order => {
            dispatch(receiveOrderUpdate());
            dispatch(receiveOrder(order));
        })
        .catch(error => { dispatch(failOrderUpdate(error)) })
    }
}

export function closeOrder(orderId) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/orders/" + orderId + "/close", null, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function cancelOrder(orderId) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/orders/" + orderId + "/cancel", null, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function updateShippingAddress(orderId, address) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/orders/" + orderId + "/shipping_address", address, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function updateBillingAddress(orderId, address) {
    return (dispatch, getState) => {
        return axios.put(restApi.url + "/orders/" + orderId + "/billing_address", address, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => { dispatch(receiveOrder(order)) })
                      .catch(error => { console.log(error.response) })
              }
}

export function createOrder(history) {
    return (dispatch, getState) => {
        const state = getState();
        return axios.post(restApi.url + "/orders", { draft: true, referrer_url: 'admin'}, { headers: restApi.headers })
                      .then(response => {
                          const orderId = response.data.id;
                          dispatch(createOrdersSuccess());
                          history.push(`/admin/order/${orderId}`);
                      })
                      .catch(error => { console.log(error.response) })
              }
}

export function checkoutOrder(orderId) {
    return (dispatch, getState) => {
        dispatch(requestOrderCheckout());
        return axios.put(restApi.url + "/orders/" + orderId + "/checkout", null, { headers: restApi.headers })
                      .then(response => response.data)
                      .then(fetchOrderAdditionalData)
                      .then(order => {
                          dispatch(receiveOrderCheckout());
                          dispatch(receiveOrder(order));
                      })
                      .catch(error => { dispatch(failOrderCheckout(error)) })
              }
}
