import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {
  checkout,
  checkoutStripe,
  updateCart,
  fetchPaymentMethods,
  updateCartPaymentMethod,
  analyticsSetPaymentMethod
} from '../../actions'
import Form from './form'

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.app.cart,
    settings: state.app.settings,
    processingCheckout: state.app.processingCheckout,
    paymentMethods: state.app.paymentMethods,
    loadingPaymentMethods: state.app.loadingPaymentMethods,
    user: state.app.userInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    finishCheckout: () => {
      dispatch(checkout(null, ownProps.history));
      dispatch(analyticsSetPaymentMethod(values.payment_method_id));
    },
    checkoutStripe: (value) => {
      dispatch(checkoutStripe(value, ownProps.history));
    },
    savePaymentMethod: (value) => {
      dispatch(updateCartPaymentMethod(value));
    },
    onLoad: () => {
      dispatch(fetchPaymentMethods());
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
