import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import * as t from './actionTypes'

const initialState = {};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case t.PRODUCT_RECEIVE:
      return Object.assign({}, state, {productDetails: action.product})

    case t.PRODUCTS_REQUEST:
      return Object.assign({}, state, {loadingProducts: true})

    case t.PRODUCTS_RECEIVE:
      if(action.products){
        return Object.assign({}, state, {
          loadingProducts: false,
          products: action.products.data,
          productsTotalCount: action.products.total_count,
          productsHasMore: action.products.has_more,
          productsAttributes: action.products.attributes,
          productsMinPrice: action.products.price.min || 0,
          productsMaxPrice: action.products.price.max || 0
        })
      } else {
        return Object.assign({}, state, {
          products: []
        })
      }

    case t.MORE_PRODUCTS_REQUEST:
      return Object.assign({}, state, {loadingMoreProducts: true})

    case t.MORE_PRODUCTS_RECEIVE:
      return Object.assign({}, state, {
        loadingMoreProducts: false,
        products: [
          ...state.products,
          ...action.products.data
        ],
        productsTotalCount: action.products.total_count,
        productsHasMore: action.products.has_more
      })

    case t.PAGE_RECEIVE:
      return Object.assign({}, state, {pageDetails: action.pageDetails})

    case t.CART_RECEIVE:
      return Object.assign({}, state, {cart: action.cart})

    case t.SHIPPING_METHODS_REQUEST:
      return Object.assign({}, state, {loadingShippingMethods: true})

    case t.SHIPPING_METHODS_RECEIVE:
      return Object.assign({}, state, {
        shippingMethods: action.methods,
        loadingShippingMethods: false
      })

    case t.PAYMENT_METHODS_REQUEST:
      return Object.assign({}, state, {loadingPaymentMethods: true})

    case t.PAYMENT_METHODS_RECEIVE:
      return Object.assign({}, state, {
        paymentMethods: action.methods,
        loadingPaymentMethods: false
      })

    case t.CHECKOUT_REQUEST:
      return Object.assign({}, state, {processingCheckout: true})

    case t.CHECKOUT_RECEIVE:
      return Object.assign({}, state, {
        cart: null,
        order: action.order,
        processingCheckout: false
      })

    case t.SITEMAP_RECEIVE:
      return Object.assign({}, state, {currentPage: action.currentPage})

    case t.SET_CURRENT_CATEGORY:
      return Object.assign({}, state, {categoryDetails: action.category})

    case t.SET_PRODUCTS_FILTER:
      return Object.assign({}, state, {
        productFilter: Object.assign({}, state.productFilter, action.filter)
      })

    case t.LOCATION_CHANGED:
      return Object.assign({}, state, {location: action.location})

    case t.PRODUCT_REQUEST:
    case t.PAGE_REQUEST:
    case t.CART_REQUEST:
    case t.CART_ITEM_ADD_REQUEST:
    case t.CART_ITEM_DELETE_REQUEST:
    case t.CART_ITEM_UPDATE_REQUEST:
    case t.SITEMAP_REQUEST:

    case t.UPDATE_PRICE:{
        return Object.assign({}, state, {shippingMethods: action.data})
    }
    case t.USER_LOGIN_STARTED: {
        return Object.assign({}, state, {isLoggingIn: true})
    }
    case t.USER_LOGIN_FULFILLED:{
        return Object.assign({}, state, {isLoggingIn: false, loggingInError: false})
    }
    case t.USER_LOGIN_REJECTED: {
        const error = action.payload.message;
        return Object.assign({}, state, {isLoggingIn: false, loggingInError: error})
    }

    case t.USER_UPDATE_STARTED: {
        return Object.assign({}, state, {isUpdatingUser: true})
    }
    case t.USER_UPDATE_FULFILLED:{
        return Object.assign({}, state, {isUpdatingUser: false, updatingUserError: false, userInfo: action.payload})
    }
    case t.USER_UPDATE_REJECTED: {
        const error = action.payload.message;
        return Object.assign({}, state, {isUpdatingUser: false, updatingUserError: error})
    }
    case t.CHANGE_PASSWORD_ERROR:{
        const error = action.payload.message;
        return Object.assign({}, state, { changePasswordError: error});
    }
    case t.GET_TOKEN_USER:{
        return Object.assign({}, state, {token: action.data.token, user: action.data.user})
    }
    case t.FILL_ORDERS:{
        return Object.assign({}, state, {orders: action.data})
    }
    case t.FILL_ADDRESSES:{
        return Object.assign({}, state, {shippingAddresses: action.data})
    }
    case t.FILL_USER:{
        return Object.assign({}, state, {userInfo: action.payload})
    }
    case t.DELETE_ADDRESS:{
        const id = action.addressId;
        var index = 0;
        for (var i = 0; i < state.shippingAddresses.length; i++){
            if (state.shippingAddresses[i].id === id ){
                index = i;
            }
        }
        state.shippingAddresses.splice(index,1);
        return Object.assign({}, state );
    }
    case t.EDIT_ADDRESS:{
        const id = action.id;
        const editAddress = state.shippingAddresses.filter(element => element.id === id)[0];
        return Object.assign({}, state, {editAddress: editAddress});
    }
    default:
      return state
  }
}

export default combineReducers({app: appReducer, form: formReducer});
