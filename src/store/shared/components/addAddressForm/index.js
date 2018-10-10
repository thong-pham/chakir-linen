import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {reset, submit} from 'redux-form';
import Form from './form'
import { addShippingAddress } from "../../actions"

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.app.settings,
    themeSettings: state.app.themeSettings,
    checkoutFields: state.app.checkoutFields,
    user: state.app.user,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      if (!values.country){
          values.country = 'United States';
      }
      //console.log(values);
      dispatch(addShippingAddress(values, ownProps.history));
    },
    saveForm: () => {
      dispatch(submit('AddAddressForm'));
    },
    onLoad: () => {}
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
