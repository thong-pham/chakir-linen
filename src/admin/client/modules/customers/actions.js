import * as t from './actionTypes'
import api from 'lib/api'
import restApi from 'lib/restApi'
import messages from 'lib/text'
import axios from 'axios'

const push = () => {}

function requestCustomer() {
  return {
    type: t.CUSTOMERS_DETAIL_REQUEST
  }
}

function receiveCustomer(item) {
  return {
    type: t.CUSTOMERS_DETAIL_RECEIVE,
    item
  }
}

export function clearCustomerDetails() {
  return receiveCustomer(null);
}

function requestCustomers() {
  return {
    type: t.CUSTOMERS_REQUEST
  }
}

function requestMoreCustomers() {
  return {
    type: t.CUSTOMERS_MORE_REQUEST
  }
}

function receiveCustomersMore({ has_more, total_count, data }) {
  return {
    type: t.CUSTOMERS_MORE_RECEIVE,
    has_more,
    total_count,
    data
  }
}

function receiveCustomers({ has_more, total_count, data }) {
  return {
    type: t.CUSTOMERS_RECEIVE,
    has_more,
    total_count,
    data
  }
}

function receiveCustomersError(error) {
  return {
    type: t.CUSTOMERS_FAILURE,
    error
  }
}

export function selectCustomer(id) {
  return {
    type: t.CUSTOMERS_SELECT,
    customerId: id
  }
}

export function deselectCustomer(id) {
  return {
    type: t.CUSTOMERS_DESELECT,
    customerId: id
  }
}

export function deselectAllCustomer() {
  return {
    type: t.CUSTOMERS_DESELECT_ALL
  }
}

export function selectAllCustomer() {
  return {
    type: t.CUSTOMERS_SELECT_ALL
  }
}

export function setFilterSearch(value) {
  return {
    type: t.CUSTOMERS_FILTER_SET_SEARCH,
    search: value
  }
}

function deleteCustomersSuccess() {
  return {
    type: t.CUSTOMER_DELETE_SUCCESS
  }
}

function setGroupSuccess() {
  return {
    type: t.CUSTOMER_SET_GROUP_SUCCESS
  }
}

const getFilter = (state, offset = 0) => {
  let filter = {
    limit: 50,
    offset: offset
  }

  if(state.customers.search && state.customers.search !== ''){
    filter.search = state.customers.search;
  }

  if(state.customerGroups.selectedId) {
    filter.group_id = state.customerGroups.selectedId;
  }

  return filter;
}

export function fetchCustomers() {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.customers.loadingItems) {
      dispatch(requestCustomers());
      dispatch(deselectAllCustomer());

      const filter = getFilter(state);
      const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
      return axios.get(restApi.url + "/users?" + query, { headers: restApi.headers })
          .then(response => { dispatch(receiveCustomers(response.data)) })
          .catch(error => { dispatch(receiveCustomersError(error)) })
      }
   }
}

export function fetchMoreCustomers() {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.customers.loadingItems) {
      dispatch(requestMoreCustomers());

      const filter = getFilter(state, state.customers.items.length);
      const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
      return axios.get(restApi.url + "/users?" + query, { headers : restApi.headers })
        .then(response => { dispatch(receiveCustomersMore(response.data)) })
        .catch(error => { dispatch(receiveCustomersError(error)) })
    }
  }
}

export function deleteCustomers() {
  return (dispatch, getState) => {
    const state = getState();
    let promises = state.customers.selected.map(customerId => axios.delete(restApi.url + "/users/" + customerId, { headers : restApi.headers }));

    return Promise.all(promises).then(values => {
        dispatch(deleteCustomersSuccess());
        dispatch(deselectAllCustomer());
        dispatch(fetchCustomers());
    }).catch(error => { console.log(error.response) });
  }
}

export function deleteCurrentCustomer() {
  return (dispatch, getState) => {
    const state = getState();
    let customer = state.customers.editCustomer;

    if(customer && customer.id) {
        return axios.delete(restApi.url + "/users/" + customer.id, { headers : restApi.headers })
                      .then(response => response.status === 200 ? response.status : undefined)
                      .catch(err => { console.log(err.response) })
    }
  }
}

export function setGroup(group_id) {
  return (dispatch, getState) => {
    const state = getState();
    let promises = state.customers.selected.map(customerId => axios.put(restApi.url + "/users/" + customerId, { group_id: group_id }, { headers : restApi.headers }));

    return Promise.all(promises).then(values => {
        dispatch(setGroupSuccess());
        dispatch(deselectAllCustomer());
        dispatch(fetchCustomers());
    }).catch(err => { console.log(err.response) })
  }
}

export function updateCustomer(data) {
  return (dispatch, getState) => {
    return axios.put(restApi.url + "/users/" + data.id, data, { headers : restApi.headers })
        .then(response => { dispatch(receiveCustomer(response.data)) })
        .catch(error => { console.log(error.response) })
  }
}

export function fetchCustomer(customerId) {
  return (dispatch, getState) => {
    dispatch(requestCustomer());

    return axios.get(restApi.url + "/users/" + customerId, { headers : restApi.headers })
        .then(response => { dispatch(receiveCustomer(response.data)) })
        .catch(error => { console.log(error.response) })
    }
}

export function approveCustomer(customer) {
  return (dispatch, getState) => {
    //dispatch(requestCustomer());
    return axios.put(restApi.url + "/users/approve/" + customer.id, { headers : restApi.headers })
        .then(response => response.data)
        .catch(error => { console.log(error.response) })
    }
}

export function updateAddress(customerId, addressId, data) {
  return (dispatch, getState) => {
      return axios.put(restApi.url + "/users/" + customerId + "/shipping_address/" + addressId, data, { headers : restApi.headers })
          .then(response => { dispatch(fetchCustomer(customerId)) })
          .catch(error => { console.log(error.response) })
      }
}

export function deleteAddress(customerId, addressId) {
  return (dispatch, getState) => {
    return axios.delete(restApi.url + "/users/" + customerId + "/shipping_address/" + addressId, { headers : restApi.headers })
        .then(response => { dispatch(fetchCustomer(customerId)) })
        .catch(error => { console.log(error.response) })
    }
}

export function setDefaultShippingAddress(customerId, addressId) {
  return (dispatch, getState) => {
    return axios.put(restApi.url + "/users/" + customerId + "/shipping_address/" + addressId + "/default_shipping", { headers : restApi.headers })
        .then(response => { dispatch(fetchCustomer(customerId)) })
        .catch(error => { console.log(error.response) })
    }
}
