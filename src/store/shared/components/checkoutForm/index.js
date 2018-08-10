import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import Form from './form'
import { fetchUserData } from '../../actions'

const mapStateToProps = (state, ownProps) => {
  return {
    cart: state.app.cart,
    settings: state.app.settings,
    themeSettings: state.app.themeSettings,
    token: state.app.token,
    user: state.app.user
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: (id) => {
        return dispatch(fetchUserData(id));
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
