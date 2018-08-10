import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'

const validate = values => {
    const errors = {}
    if (values.confirmEmail !== values.email){
        errors.confirmEmail = 'Please confirm that your email address matches and try again.'
    }
    return errors
}

const validateRequired = value => value && value.length > 0 ? undefined : text.required;

const validateEmail = value => value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
  ? text.emailInvalid
  : undefined;

const inputField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <input {...field.input} placeholder={field.placeholder} type={field.type} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}/>
  </div>
)

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false
    };
  }

  componentDidMount() {
      if (localStorage.getItem('token')){
          this.props.history.push('/');
      }
  }

  // componentWillReceiveProps(nextProps) {
  //   if(this.props.show !== nextProps.show){
  //     this.setState({
  //       done: !nextProps.show
  //     });
  //   }
  // }

  handleSave = () => {
    this.props.saveForm();
    //this.props.onSave();
  };

  handleEdit = () => {
    this.setState({
      done: false
    });
    this.props.onEdit();
  };

  getField = (fieldName) => {
    const fields = this.props.registerFields || [];
    const field = fields.find(item => item.name === fieldName);
    return field;
  }

  getFieldStatus = (fieldName) => {
    const field = this.getField(fieldName);
    return field && field.status ? field.status : 'required';
  }

  isFieldOptional = (fieldName) => {
    return this.getFieldStatus(fieldName) === 'optional';
  }

  isFieldHidden = (fieldName) => {
    return this.getFieldStatus(fieldName) === 'hidden';
  }

  getFieldValidators = (fieldName) => {
    const isOptional = this.isFieldOptional(fieldName);
    let validatorsArray = [];
    if(!isOptional) {
      validatorsArray.push(validateRequired);
    }
    if(fieldName === 'email') {
      validatorsArray.push(validateEmail);
    }

    return validatorsArray;
  }

  getFieldPlaceholder = (fieldName) => {
    const field = this.getField(fieldName);
    return field && field.placeholder && field.placeholder.length > 0 ? field.placeholder : '';
  }

  getFieldLabelText = (fieldName) => {
    const field = this.getField(fieldName);
    if(field && field.label && field.label.length > 0) {
      return field.label;
    } else {
      switch (fieldName) {
        case 'email':
          return text.email
          break;
        case 'password':
          return text.password
          break;
        default:
          return 'Unnamed field';
      }
    }
  }

  getFieldLabel = (fieldName) => {
    const labelText = this.getFieldLabelText(fieldName);
    return this.isFieldOptional(fieldName) ? `${labelText} (${text.optional})` : labelText;
  }

  render() {
    const {
      handleSubmit,
      pristine,
      invalid,
      valid,
      reset,
      submitting,
      settings,
      themeSettings,
      loggingInError
    } = this.props;

    const {
      registerInputClass = 'register-field',
      registerButtonClass = 'register-button button is-primary'
    } = themeSettings;

    const inputClassName = registerInputClass;
    const buttonClassName = registerButtonClass;
    //const { shippingMethods } = this.state;
    let error = null;
    if (loggingInError){
        error = (
            <div className="error-box">{loggingInError}</div>
        )
    }
    return (
        <div className="register-step">

          <form onSubmit={handleSubmit}>

            {!this.isFieldHidden('email') &&
              <Field className={inputClassName} name="email" id="customer.email" component={inputField} type="email"
                label={this.getFieldLabel('email')}
                validate={this.getFieldValidators('email')}
                placeholder={this.getFieldPlaceholder('email')}/>
            }

            {!this.isFieldHidden('password') &&
              <Field className={inputClassName} name="password" id="customer.password" component={inputField} type="password"
                label={this.getFieldLabel('password')}
                validate={this.getFieldValidators('password')}
                placeholder={this.getFieldPlaceholder('password')}/>
            }
            {error}
            <div className="register-button-wrap">
              <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.login}
              </button>
            </div>

          </form>

        </div>
      )
  }
}

export default reduxForm({form: 'LoginForm', enableReinitialize: true, keepDirtyOnReinitialize: true, validate})(LoginForm)
