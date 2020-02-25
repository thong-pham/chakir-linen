import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { updateProduct  } from '../../actions'
import WholesaleForm from './components/form'

const mapStateToProps = (state, ownProps) => {
  return {
    initialValues: state.products.editProduct
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSubmit: (values) => {
      dispatch(updateProduct({
        id: values.id,
        prices: values.prices
      }));
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WholesaleForm));
