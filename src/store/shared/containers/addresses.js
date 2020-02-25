import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {mapStateToProps, mapDispatchToProps} from '../containerProps'
import {AddressContainer} from 'theme'
import AddAddressForm from '../components/addAddressForm'
import EditAddressForm from '../components/editAddressForm'

const ConnectedAddressContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(AddressContainer));

export default() => {
  return <ConnectedAddressContainer addAddressForm={<AddAddressForm />} editAddressForm={<EditAddressForm />}  />
}
