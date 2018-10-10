import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'
import CountryList from '../countryList'

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

class EditAddressForm extends React.Component {
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
    const fields = this.props.formFields || [];
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
        case 'full_name':
          return text.fullName;
        case 'address1':
          return text.address1;
        case 'address2':
          return text.address2;
        case 'city':
          return text.city;
        case 'state':
          return text.state;
        case 'country':
          return text.country;
        case 'postal_code':
          return text.postal_code;
        case 'phone':
          return text.phone;
        case 'company':
          return text.company;
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
      initialValues,
      submitting,
      settings,
      themeSettings,
      user
    } = this.props;
    //console.log(initialValues);
    const {
      formInputClass = 'form-field',
      formButtonClass = 'form-button button is-primary',
      formSelectClass = 'form-select'
    } = themeSettings;

    const inputClassName = formInputClass;
    const buttonClassName = formButtonClass;
    const selectClassName = formSelectClass;
    if (initialValues){
        if (initialValues.residential === true) initialValues.residential = 'true';
        else initialValues.residential = 'false';
    }
    return (

          <form onSubmit={handleSubmit} style={{padding: '30px'}}>
            <h1>Edit your address </h1>
            <hr />

            {!this.isFieldHidden('full_name') &&
              <Field className={inputClassName} name="full_name" id="full_name" component={inputField} type="text"
                //label={this.getFieldLabel('full_name')}
                validate={this.getFieldValidators('full_name')}
                placeholder={this.getFieldPlaceholder('full_name')}/>
            }

            {!this.isFieldHidden('address1') &&
              <Field className={inputClassName} name="address1" id="address1" component={inputField} type="text"
                //label={this.getFieldLabel('address1')}
                validate={this.getFieldValidators('address1')}
                placeholder={this.getFieldPlaceholder('address1')}/>
            }

            {!this.isFieldHidden('city') &&
              <Field className={inputClassName} name="city" id="city" component={inputField} type="text"
                //label={this.getFieldLabel('city')}
                validate={this.getFieldValidators('city')}
                placeholder={this.getFieldPlaceholder('city')}/>
            }

            {!this.isFieldHidden('state') &&
              <Field className={inputClassName} name="state" id="state" component={inputField} type="text"
                //label={this.getFieldLabel('state')}
                validate={this.getFieldValidators('state')}
                placeholder={this.getFieldPlaceholder('state')}/>
            }

            {!this.isFieldHidden('postal_code') &&
              <Field className={inputClassName} name="postal_code" id="postal_code" component={inputField} type="text"
                //label={this.getFieldLabel('postal_code')}
                validate={this.getFieldValidators('postal_code')}
                placeholder={this.getFieldPlaceholder('postal_code')}/>
            }

            {!this.isFieldHidden('residential') &&
              <div className="columns">
                <div className="column is-4">
                  <label>Is Residential</label>
                </div>
                <div className="column is-4">
                  <label><Field className="form-field-radio" name="residential" id="residential" component={inputField} type="radio" value="true" /> Yes</label>
                </div>
                <div className="column is-4">
                  <label><Field className="form-field-radio" name="residential" id="residential" component={inputField} type="radio" value="false" /> No</label>
                </div>
              </div>
            }

            {!this.isFieldHidden('country') && <div className={selectClassName}>
              <span className="select is-fullwidth">
                <CountryList country="country"/>
              </span>
            </div>
            }

            {!this.isFieldHidden('phone') &&
              <Field className={inputClassName} name="phone" id="phone" component={inputField} type="tel"
                //label={this.getFieldLabel('phone')}
                validate={this.getFieldValidators('phone')}
                placeholder={this.getFieldPlaceholder('phone')}/>
            }

            {!this.isFieldHidden('company') &&
              <Field className={inputClassName} name="company" id="company" component={inputField} type="text"
                //label={this.getFieldLabel('company')}
                //validate={this.getFieldValidators('company')}
                placeholder={this.getFieldPlaceholder('company')}/>
            }

            <div className="form-button-wrap">
              <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.saveChange}
              </button>
            </div>

          </form>
      )
  }
}

export default reduxForm({form: 'EditAddressForm', enableReinitialize: true, keepDirtyOnReinitialize: true, validate})(EditAddressForm)
