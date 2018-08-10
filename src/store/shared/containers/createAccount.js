import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {mapStateToProps, mapDispatchToProps} from '../containerProps'
import {CreateAccountContainer} from 'theme'
import CreateAccountForm from '../components/createAccountForm'

const ConnectedCreateAccountContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateAccountContainer));

export default() => {
  return <ConnectedCreateAccountContainer createAccountForm={<CreateAccountForm />} />
}
