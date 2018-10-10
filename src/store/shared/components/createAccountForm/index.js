import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'
import { createAccount } from "../../actions"

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.app.cart,
    settings: state.app.settings,
    themeSettings: state.app.themeSettings,
    checkoutFields: state.app.checkoutFields,
    creatingUserError: state.app.creatingUserError
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
       //console.log(values);
       dispatch(createAccount(values, ownProps.history));
    },
    saveForm: (values) => {
       dispatch(submit('CreateAccountForm'));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
