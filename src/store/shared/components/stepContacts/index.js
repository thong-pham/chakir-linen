import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'

import {
  checkout,
  updateCart
} from '../../actions'

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
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
