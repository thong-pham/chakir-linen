import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'
import { login } from "../../actions"

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.app.settings,
    themeSettings: state.app.themeSettings,
    checkoutFields: state.app.checkoutFields,
    loggingInError: state.app.loggingInError
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      //console.log(values);
      dispatch(login(values, ownProps.history));
    },
    saveForm: (values) => {
      dispatch(submit('LoginForm'));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
