import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'
import { addShippingAddress, updateShippingAddress } from "../../actions"

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.app.settings,
    themeSettings: state.app.themeSettings,
    checkoutFields: state.app.checkoutFields,
    user: state.app.user,
    initialValues: state.app.editAddress
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      dispatch(updateShippingAddress(values, ownProps.history));
    },
    saveForm: () => {
      dispatch(submit('EditAddressForm'));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
