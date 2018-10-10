import { connect } from 'react-redux'
import { fetchEmailSettings, fetchEmailTemplates } from '../actions'
import Form from './components/form'

const mapStateToProps = (state) => {
  return {
    emailSettings: state.settings.emailSettings,
    emailTemplates: state.settings.emailTemplates
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: () => {
      dispatch(fetchEmailSettings());
      dispatch(fetchEmailTemplates());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
