import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'

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

class CheckoutStepContacts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false
    };
  }

  componentDidMount() {
     this.props.onLoad();
  }

  handleSave = () => {
    this.setState({
      done: true
    });
    this.props.saveForm();
    this.props.onSave();
  };

  handleEdit = () => {
    this.setState({
      done: false
    });
    this.props.onEdit();
  };

  getField = (fieldName) => {
    const fields = this.props.checkoutFields || [];
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
    const placeholder = this.getFieldLabelText(fieldName);
    return field && field.placeholder && field.placeholder.length > 0 ? field.placeholder : placeholder;
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
        case 'mobile':
          return text.mobile;
          break;
        case 'country':
          return text.country;
          break;
        case 'state':
          return text.state;
          break;
        case 'city':
          return text.city;
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
      initialValues,
      settings,
      inputClassName,
      buttonClassName,
      editButtonClassName
    } = this.props;
    //const { shippingMethods } = this.state;
    if(this.state.done){
      return (
        <div className="checkout-step">
          <h1><span>1</span>{this.props.title}</h1>

          {!this.isFieldHidden('firstName') &&
            <div className="checkout-field-preview">
              <div className="name">{text.firstName}</div>
              <div className="value">{initialValues.firstName}</div>
            </div>
          }

          {!this.isFieldHidden('lastName') &&
            <div className="checkout-field-preview">
              <div className="name">{text.lastName}</div>
              <div className="value">{initialValues.lastName}</div>
            </div>
          }

          {!this.isFieldHidden('email') &&
            <div className="checkout-field-preview">
              <div className="name">{text.email}</div>
              <div className="value">{initialValues.email}</div>
            </div>
          }

          {!this.isFieldHidden('mobile') &&
            <div className="checkout-field-preview">
              <div className="name">{text.mobile}</div>
              <div className="value">{initialValues.mobile}</div>
            </div>
          }

          <div className="checkout-button-wrap">
            <button
              type="button"
              onClick={this.handleEdit}
              className={editButtonClassName}>
              {text.edit}
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="checkout-step">
          <h1><span>1</span>{this.props.title}</h1>
          <form onSubmit={handleSubmit}>

            {!this.isFieldHidden('firstName') &&
              <Field className={inputClassName} name="firstName" id="customer.firstName" component={inputField} type="text"
                //label={this.getFieldLabel('firstName')}
                validate={this.getFieldValidators('firstName')}
                placeholder={this.getFieldPlaceholder('firstName')}/>
            }

            {!this.isFieldHidden('lastName') &&
              <Field className={inputClassName} name="lastName" id="customer.lastName" component={inputField} type="text"
                //label={this.getFieldLabel('lastName')}
                validate={this.getFieldValidators('lastName')}
                placeholder={this.getFieldPlaceholder('lastName')}/>
            }

            {!this.isFieldHidden('email') &&
              <Field className={inputClassName} name="email" id="customer.email" component={inputField} type="email"
                //label={this.getFieldLabel('email')}
                validate={this.getFieldValidators('email')}
                placeholder={this.getFieldPlaceholder('email')}/>
            }

            {!this.isFieldHidden('mobile') &&
              <Field className={inputClassName} name="mobile" id="customer.mobile" component={inputField} type="tel"
                //label={this.getFieldLabel('mobile')}
                validate={this.getFieldValidators('mobile')}
                placeholder={this.getFieldPlaceholder('mobile')}/>
            }

            <div className="checkout-button-wrap">
              <button
                type="button"
                onClick={handleSubmit(data => {
                  this.handleSave();
                })}
                disabled={invalid}
                className={buttonClassName}>
                {text.next}
              </button>
            </div>

          </form>
        </div>
      )
    }
  }
}

export default reduxForm({form: 'CheckoutStepContacts', enableReinitialize: true, keepDirtyOnReinitialize: true})(CheckoutStepContacts)
