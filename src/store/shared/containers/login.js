import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {mapStateToProps, mapDispatchToProps} from '../containerProps'
import {LoginContainer} from 'theme'
import LoginForm from '../components/loginForm'

const ConnectedLoginContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginContainer));

export default() => {
  return <ConnectedLoginContainer loginForm={<LoginForm />} />
}
