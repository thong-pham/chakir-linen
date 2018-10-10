import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'

import {
  updateShipping
} from '../../actions'

const mapStateToProps = (state, ownProps) => {
  return {
    initialValues: state.app.cart,
    settings: state.app.settings,
    checkoutFields: state.app.checkoutFields,
    user: state.app.userInfo
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    submitAddress: (data) => {
        data.comments = '';
        return dispatch(updateShipping(data));
    },
    submitAddressWithoutLogin: (data) => {
        return dispatch(updateShipping(data));
    },
    saveForm: (values) => {
        dispatch(submit('CheckoutStepShipping'));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
