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
  updateShipping
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
    processingCheckout: state.app.processingCheckout,
    user: state.app.userInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // onSubmit: (values) => {
    //   console.log(values);
    //   if (values.shipping_address.length > 1){
    //       var array = values.shipping_address.split(', ');
    //       const shipping_address = {
    //           full_name: array[0],
    //           address1: array[1],
    //           city: array[2],
    //           state: array[3],
    //           postal_code: array[4],
    //           country: array[5],
    //           phone: array[6]
    //       }
    //       values.shipping_address = shipping_address;
    //   }
    //   console.log(values);
    //   dispatch(updateShipping(values));
    //   dispatch(analyticsSetShippingMethod(values.shipping_method_id));
    // },
    submitAddress: (data) => {
        data.comments = '';
        return dispatch(updateShipping(data));
        //console.log(data);
    },
    saveForm: (values) => {
        dispatch(submit('CheckoutStepShipping'));
    },
    saveShippingMethod: (value) => {
        dispatch(updateCartShippingMethod(value));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
