import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'
import {
  fetchShippingMethods,
  updateCartShippingCountry,
  updateCartShippingState,
  updateCartShippingCity,
  updateCartShippingMethod,
  analyticsSetShippingMethod,
  checkout,
  updateShipping,
  updateShippingPrice
} from '../../actions'

const mapStateToProps = (state, ownProps) => {
  let shippingMethod = null;
  const { shipping_method_id } = state.app.cart;
  if(shipping_method_id && state.app.shippingMethods && state.app.shippingMethods.length > 0){
    shippingMethod = state.app.shippingMethods.find(method => method.id === shipping_method_id);
  }

  return {
    shippingMethod: shippingMethod,
    shippingMethods: state.app.shippingMethods,
    loadingShippingMethods: state.app.loadingShippingMethods,
    initialValues: state.app.cart,
    settings: state.app.settings,
    checkoutFields: state.app.checkoutFields,
    processingCheckout: state.app.processingCheckout
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      dispatch(updateShipping(values));
      dispatch(analyticsSetShippingMethod(values.shipping_method_id));
    },
    saveForm: (values) => {
      dispatch(submit('CheckoutShippingMethod'));
    },
    finishCheckout: (values) => {
      dispatch(checkout(values, ownProps.history));
    },
    saveShippingMethod: (value, price) => {
      dispatch(updateCartShippingMethod(value, price));
    },
    updateShippingPrice: (value) => {
        dispatch(updateShippingPrice(value));
    },
    onLoad: () => {
       dispatch(fetchShippingMethods());
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
