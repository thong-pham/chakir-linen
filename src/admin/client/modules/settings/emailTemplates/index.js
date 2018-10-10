import { connect } from 'react-redux'
import { fetchEmailTemplate, updateEmailTemplate, receiveEmailTemplate, addEmailTemplate } from '../actions'
import Form from './components/form'

const mapStateToProps = (state, ownProps) => {
  return {
    initialValues: state.settings.emailTemplate
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoad: () => {
      const {templateName} = ownProps.match.params;
      if (templateName !== 'add'){
          dispatch(fetchEmailTemplate(templateName))
      }
      else {
          const emailTemplate = {
              name: '',
              subject: '',
              body: ''
          }
          dispatch(receiveEmailTemplate(emailTemplate));
      }

    },
    onSubmit: (values) => {
      if (values.id){
          dispatch(updateEmailTemplate(values));
      }
      else {
          dispatch(addEmailTemplate(values)).then(data => {
              ownProps.history.push('/admin/settings/email')
          })
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
