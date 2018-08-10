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

class CreateAccountForm extends React.Component {
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
        case 'firstName':
          return text.firstName
          break;
        case 'lastName':
          return text.lastName
          break;
        case 'email':
          return text.email;
          break;
        case 'confirmEmail':
          return text.confirmEmail;
          break;
        case 'mobile':
          return text.mobile;
          break;
        case 'password':
          return text.password;
          break;
        case 'businessName':
          return text.businessName;
          break
        case 'businessPhone':
          return text.businessPhone;
          break;
        case 'businessCategory':
          return text.businessCategory;
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
      themeSettings
    } = this.props;

    const {
      registerInputClass = 'register-field',
      registerButtonClass = 'register-button button is-primary'
    } = themeSettings;

    const inputClassName = registerInputClass;
    const buttonClassName = registerButtonClass;
    //const { shippingMethods } = this.state;
    return (
        <div className="register-step">

          <form onSubmit={handleSubmit}>
            <h1><span>1</span> {text.customerDetails}</h1>
            {!this.isFieldHidden('firstName') &&
              <Field className={inputClassName} name="firstName" id="customer.firstName" component={inputField} type="text"
                label={this.getFieldLabel('firstName')}
                validate={this.getFieldValidators('firstName')}
                placeholder={this.getFieldPlaceholder('firstName')}/>
            }

            {!this.isFieldHidden('lastName') &&
              <Field className={inputClassName} name="lastName" id="customer.lastName" component={inputField} type="text"
                label={this.getFieldLabel('lastName')}
                validate={this.getFieldValidators('lastName')}
                placeholder={this.getFieldPlaceholder('lastName')}/>
            }

            {!this.isFieldHidden('mobile') &&
              <Field className={inputClassName} name="mobile" id="customer.mobile" component={inputField} type="tel"
                label={this.getFieldLabel('mobile')}
                validate={this.getFieldValidators('mobile')}
                placeholder={this.getFieldPlaceholder('mobile')}/>
            }

            {!this.isFieldHidden('email') &&
              <Field className={inputClassName} name="email" id="customer.email" component={inputField} type="email"
                label={this.getFieldLabel('email')}
                validate={this.getFieldValidators('email')}
                placeholder={this.getFieldPlaceholder('email')}/>
            }

            {!this.isFieldHidden('confirmEmail') &&
              <Field className={inputClassName} name="confirmEmail" id="customer.confirmEmail" component={inputField} type="email"
                label={this.getFieldLabel('confirmEmail')}
                validate={this.getFieldValidators('confirmEmail')}
                placeholder={this.getFieldPlaceholder('confirmEmail')}/>
            }

            <h1><span>2</span> {text.businessInfo}</h1>

            {!this.isFieldHidden('businessName') &&
              <Field className={inputClassName} name="businessName" id="customer.businessName" component={inputField} type="text"
                label={this.getFieldLabel('businessName')}
                //validate={this.getFieldValidators('businessName')}
                placeholder={this.getFieldPlaceholder('businessName')}/>
            }

            {!this.isFieldHidden('businessPhone') &&
              <Field className={inputClassName} name="businessPhone" id="customer.businessPhone" component={inputField} type="tel"
                label={this.getFieldLabel('businessPhone')}
                //validate={this.getFieldValidators('businessPhone')}
                placeholder={this.getFieldPlaceholder('businessPhone')}/>
            }

            {!this.isFieldHidden('businessCategory') && <div><label>{this.getFieldLabel('businessCategory')}</label>
              <Field className={inputClassName} name="businessCategory" id="customer.businessCategory" component='select'>
                <option value="">Choose one...</option>
                <option value="Contractors and Services Provider">Contractors and Services Provider</option>
                <option value="Education">Education</option>
                <option value="Health Services">Health Services</option>
                <option value="Hospitality and Entertainment">Hospitality and Entertainment</option>
                <option value="Property Management and Maintenance">Property Management and Maintenance</option>
                <option value="Retail">Retail</option>
                <option value="Other Customer Type">Other Customer Type</option>
              </Field></div>
            }

            <h1><span>3</span> {text.createPassword}</h1>

            {!this.isFieldHidden('password') &&
              <Field className={inputClassName} name="password" id="customer.password" component={inputField} type="password"
                label={this.getFieldLabel('password')}
                validate={this.getFieldValidators('password')}
                placeholder={this.getFieldPlaceholder('password')}/>
            }

            <div className="register-button-wrap">
              <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.completeRegistration}
              </button>
            </div>

          </form>
        </div>
      )
  }
}

export default reduxForm({form: 'CreateAccountForm', enableReinitialize: true, keepDirtyOnReinitialize: true, validate})(CreateAccountForm)
