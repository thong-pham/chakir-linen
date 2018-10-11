import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'
import axios from 'axios'
import storeSettings from '../../../client/settings'

const URL = "http://localhost:3001/api/v1/";

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
      done: false,
      businessInfo: false,
      groups: null,
      license: false
    };
  }

  componentDidMount() {
      if (localStorage.getItem('token')){
          this.props.history.push('/');
      }
      else {
        return axios.get(storeSettings.ajaxBaseUrl + "/user_groups")
          .then(response => {
              this.setState({groups: response.data});
          })
          .catch(error => {
              console.log(error.response);
          });
      }
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
        case 'customerType':
          return text.customerType;
          break
        case 'regularCustomer':
          return text.regularCustomer;
          break
        case 'reseller':
          return text.reseller;
          break
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

  chooseType = (e) => {
      if (e.target.value === 'Reseller') this.setState({businessInfo: true});
      else this.setState({businessInfo: false});
  }

  inState = (e) => {
      if (e.target.value === 'true') this.setState({license: true});
      else this.setState({license: false});
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
      creatingUserError
    } = this.props;

    const { businessInfo, groups, license } = this.state;

    const {
      formInputClass = 'form-field',
      formButtonClass = 'form-button button is-primary',
      formSelectClass = 'form-select'
    } = themeSettings;

    const inputClassName = formInputClass;
    const buttonClassName = formButtonClass;
    const selectClassName = formSelectClass;

    let groupView = null;
    if (groups && groups.length > 0){
        groupView = groups.map(group =>
          <div key={group.id} className="column is-6">
            <label><Field className="form-field-radio" name="customerType" id="customer.customerType" component={inputField} type="radio"
              validate={this.getFieldValidators('customerType')}
              value={group.name} onChange={this.chooseType}/>{' '} {group.name}</label>
          </div>
        )
    }

    let error = null;
    if (creatingUserError){
        error = (
            <div className="error-box">{creatingUserError}</div>
        )
    }
    return (
        <div className="form-step">

          <form onSubmit={handleSubmit}>
            <h1><span>1</span> {text.customerDetails}</h1>
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

            {!this.isFieldHidden('mobile') &&
              <Field className={inputClassName} name="mobile" id="customer.mobile" component={inputField} type="tel"
                //label={this.getFieldLabel('mobile')}
                validate={this.getFieldValidators('mobile')}
                placeholder={this.getFieldPlaceholder('mobile')}/>
            }

            {!this.isFieldHidden('email') &&
              <Field className={inputClassName} name="email" id="customer.email" component={inputField} type="email"
                //label={this.getFieldLabel('email')}
                validate={this.getFieldValidators('email')}
                placeholder={this.getFieldPlaceholder('email')}/>
            }

            {!this.isFieldHidden('confirmEmail') &&
              <Field className={inputClassName} name="confirmEmail" id="customer.confirmEmail" component={inputField} type="email"
                //label={this.getFieldLabel('confirmEmail')}
                validate={this.getFieldValidators('confirmEmail')}
                placeholder={this.getFieldPlaceholder('confirmEmail')}/>
            }

            {!this.isFieldHidden('customerType') &&
              <div className="columns">{/*<label>{this.getFieldLabel('customerType')}</label>*/}
                {groupView}
              </div>
            }

            <hr />

            {(businessInfo) &&
                <div><h1><span>2</span> {text.businessInfo}</h1>

                {!this.isFieldHidden('businessName') &&
                  <Field className={inputClassName} name="businessName" id="customer.businessName" component={inputField} type="text"
                    validate={this.getFieldValidators('businessName')}
                    placeholder={this.getFieldPlaceholder('businessName')}/>
                }

                {!this.isFieldHidden('businessPhone') &&
                  <Field className={inputClassName} name="businessPhone" id="customer.businessPhone" component={inputField} type="tel"
                    validate={this.getFieldValidators('businessPhone')}
                    placeholder={this.getFieldPlaceholder('businessPhone')}/>
                }

                {!this.isFieldHidden('businessCategory') && <div className={selectClassName}>
                    <span className="select is-fullwidth">
                      <Field name="businessCategory" id="customer.businessCategory" component='select'>
                        <option value="">Please select business category</option>
                        <option value="Contractors and Services Provider">Contractors and Services Provider</option>
                        <option value="Education">Education</option>
                        <option value="Health Services">Health Services</option>
                        <option value="Hospitality and Entertainment">Hospitality and Entertainment</option>
                        <option value="Property Management and Maintenance">Property Management and Maintenance</option>
                        <option value="Retail">Retail</option>
                        <option value="Other Customer Type">Other Customer Type</option>
                      </Field>
                    </span>
                  </div>
                }

                {!this.isFieldHidden('inState') &&
                  <div className="columns">
                    <div className="column is-6">
                      <label>Are you in California</label>
                    </div>
                    <div className="column is-3">
                      <label><Field className="form-field-radio" name="inState" id="customer.inState" component={inputField} type="radio" value="true" onChange={this.inState}/> Yes</label>
                    </div>
                    <div className="column is-3">
                      <label><Field className="form-field-radio" name="inState" id="customer.inState" component={inputField} type="radio" value="false" onChange={this.inState}/> No</label>
                    </div>
                  </div>
                }

                {!this.isFieldHidden('inState') && (license) &&
                  <div className="columns">
                    <div className="column is-6">
                      <label>Do you have a reseller license</label>
                    </div>
                    <div className="column is-3">
                      <label><Field className="form-field-radio" name="license" id="customer.license" component={inputField} type="radio" value="true"/> Yes</label>
                    </div>
                    <div className="column is-3">
                      <label><Field className="form-field-radio" name="license" id="customer.license" component={inputField} type="radio" value="false"/> No</label>
                    </div>
                  </div>
                }

                <hr /></div>
            }

            <h1>{(businessInfo) ? <span>3</span> : <span>2</span>} {text.createPassword}</h1>

            {!this.isFieldHidden('password') &&
              <Field className={inputClassName} name="password" id="customer.password" component={inputField} type="password"
                //label={this.getFieldLabel('password')}
                validate={this.getFieldValidators('password')}
                placeholder={this.getFieldPlaceholder('password')}/>
            }
            {error}
            <div className="form-button-wrap">
              <button
                  type="submit"
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
