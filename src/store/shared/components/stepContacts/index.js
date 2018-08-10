import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import {
  checkout,
  updateCart,
  fetchShippingMethods,
  fetchPaymentMethods,
  updateCartShippingCountry,
  updateCartShippingState,
  updateCartShippingCity,
  updateCartShippingMethod,
  updateCartPaymentMethod,
  analyticsSetShippingMethod,
  analyticsSetPaymentMethod
} from '../../actions'
import Form from './form'

const mapStateToProps = (state, ownProps) => {
  return {
    initialValues: state.app.cart,
    settings: state.app.settings,
    checkoutFields: state.app.checkoutFields
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      dispatch(updateCart(values));
    },
    saveForm: (values) => {
      dispatch(submit('CheckoutStepContacts'));
    },
    saveShippingCountry: (countryName) => {
      if(countryName && countryName.length > 0) {
        dispatch(updateCartShippingCountry(countryName));
      }
    },
    saveShippingState: (stateName) => {
      if(stateName && stateName.length > 0) {
        dispatch(updateCartShippingState(stateName));
      }
    },
    saveShippingCity: (cityName) => {
      if(cityName && cityName.length > 0) {
        dispatch(updateCartShippingCity(cityName));
      }
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
