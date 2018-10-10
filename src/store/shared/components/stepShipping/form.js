import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'
import AddAddressForm from '../addAddressForm'
import CountryList from '../countryList'

const validateRequired = value => value && value.length > 0 ? undefined : text.required;

const inputField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <input {...field.input} placeholder={field.placeholder} type={field.type} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}/>
  </div>
)

const textareaField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <textarea {...field.input} placeholder={field.placeholder} rows={field.rows} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}></textarea>
  </div>
)

const getFieldLabelByKey = (key) => {
  switch (key) {
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
      return '';
  }
}

const getFieldLabel = (field) => {
  const label = field.label && field.label.length > 0 ? field.label : getFieldLabelByKey(field.key);
  return field.required === true ? label : `${label} (${text.optional})`;
}

class CheckoutStepShipping extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
      billingAsShipping: false,
      openModal: false,
      openOption: false,
      defaultAddress: null,
      chosenAddress: null,
      finalShippingAddress: null,
      finalBillingAddress: null
    };
  }

  componentDidMount() {
      const { user } = this.props;
      if (user && user.shipping_addresses.length > 0) {
           const address = user.shipping_addresses.filter(element => element.default_shipping === true)[0];
           this.setState({chosenAddress: address});
      }
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

  onChangeBillingAsShipping = (event) => {
    this.setState({
      billingAsShipping: event.target.checked
    });
  };

  openForm = () => {
      this.setState({openModal: true});
  }

  closeForm = () => {
      this.setState({openModal: false});
  }

  openOption = () => {
      this.setState({openOption: true});
  }

  closeOption = () => {
      this.setState({openOption: false});
  }

  setAddress = (e) => {
      this.setState({chosenAddress: e.target.value});
  }

  useAddress = () => {
      const { chosenAddress } = this.state;
      var array = chosenAddress.split(', ');
      const shipping_address = {
          full_name: array[0],
          address1: array[1],
          city: array[2],
          state: array[3],
          postal_code: array[4],
          country: array[5],
          phone: array[6],
          residential: array[7]
      }
      this.setState({finalShippingAddress: shipping_address, defaultAddress: shipping_address, openOption: false});
  }

  onSubmit = (values) => {
      this.chooseAddress(values.billing_address);
  }

  onSubmitWithoutLogin = (values) => {
      if (values.shipping_address.country === ''){
          values.shipping_address.country = 'United States';
      }
      if (values.billing_address.address1 === ''){
          values.billing_address = values.shipping_address;
      }
      const data = {shipping_address: values.shipping_address, billing_address: values.billing_address, comments: values.comments};
      //console.log(data);
      this.props.submitAddressWithoutLogin(data).then(data => {
          this.setState({done: true});
          this.props.onSave();
      },this);
  }

  updateChosenAddress = (defaultAddress) => {
      this.setState({chosenAddress: defaultAddress});
  }

  chooseAddress = (billing_address) => {
      let { chosenAddress, billingAsShipping, finalShippingAddress } = this.state;
      const { initialValues, user } = this.props;
      //console.log(initialValues);
      let finalBillingAddress = null;

      if (finalShippingAddress === null){
          if (initialValues.shipping_address.full_name !== ''){
              finalShippingAddress = initialValues.shipping_address
          }
          else {
              delete chosenAddress.id;
              delete chosenAddress.default_billing;
              delete chosenAddress.default_shipping;
              finalShippingAddress = chosenAddress;
          }
      }

      if (billingAsShipping || billing_address.address1 === '') {
          finalBillingAddress = finalShippingAddress;
      }
      else {
          finalBillingAddress = billing_address;
      }
      finalShippingAddress.id = user.currentOrderId;
      finalShippingAddress.id = user.currentOrderId;
      const data = {shipping_address: finalShippingAddress, billing_address: finalBillingAddress};
      //console.log(data);
      this.props.submitAddress(data).then(data => {
          this.setState({done: true});
          this.props.onSave();
      },this);
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
      checkoutFields,
      settings,
      inputClassName,
      buttonClassName,
      editButtonClassName,
      user
    } = this.props;

    const selectClassName = "form-select";

    const { openModal, openOption } = this.state;
    let { defaultAddress } = this.state;

    const hideBillingAddress = settings.hide_billing_address === true;
    //const { payment_method_gateway, grand_total } = initialValues;
    //const showPaymentForm = payment_method_gateway && payment_method_gateway !== '';
    const showPaymentForm = true;
    const commentsField = checkoutFields.find(f => f.name === 'comments');
    const commentsFieldPlaceholder = commentsField && commentsField.placeholder && commentsField.placeholder.length > 0 ? commentsField.placeholder : 'Any instructions to find this address';
    const commentsFieldLabel = commentsField && commentsField.label && commentsField.label.length > 0 ? commentsField.label : text.comments;
    const commentsFieldStatus = commentsField && commentsField.status.length > 0 ? commentsField.status : null;
    const commentsValidate = commentsFieldStatus === 'required' ? validateRequired : null;
    const hideCommentsField = commentsFieldStatus === 'hidden';

    const fields = [
        {key: "full_name", label: "Full Name", required: true},
        {key: "address1", label: "Street Address", required: true},
        {key: "city", label: "City", required: true},
        {key: "state", label: "State/Province", required: true},
        {key: "postal_code", label: "Zip Code", required: true},
        {key: "residential", label: "Is Residential", required: true},
        {key: "country", label: "Country", required: true},
        {key: "phone", label: "Phone", required: true}
    ]

  //   const shipping_addresses = [
  //       {
  //         full_name: "Thong Pham",
  //         address1: "1851 E Walnut Creek Pkwy",
  //         phone: "12345",
  //         city: "West Covina",
  //         state: "CA",
  //         country: "United States",
  //         postal_code: "91791",
  //         phone: "714 949 9561"
  //     },
  //     {
  //       full_name: "John",
  //       address1: "1251 Citrus Way",
  //       phone: "12345",
  //       city: "El Monte",
  //       state: "CA",
  //       country: "United States",
  //       postal_code: "91781",
  //       phone: "123 456 7890"
  //   }
  // ]

    if(!this.props.show){
      return (
        <div className="checkout-step">
          <h1>{(user) ? <span>1</span> : <span>2</span>} {this.props.title}</h1>
        </div>
      )
    } else if(this.state.done){

      let shippingFields = null;
        shippingFields = fields.map((field, index) => {
          const fieldLabel = getFieldLabel(field);
          let fieldValue = initialValues.shipping_address[field.key];
          if (typeof fieldValue === 'boolean') fieldValue = fieldValue.toString();
          return <div key={index} className="checkout-field-preview">
            <div className="name">{fieldLabel}</div>
            <div className="value">{fieldValue}</div>
          </div>
        })

      return (
        <div className="checkout-step">
          <h1>{(user) ? <span>1</span> : <span>2</span>} {this.props.title}</h1>
          {shippingFields}

          {!hideCommentsField && initialValues.comments !== '' &&
            <div className="checkout-field-preview">
                <div className="name">{commentsFieldLabel}</div>
                <div className="value">{initialValues.comments}</div>
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
    } else if (!user){

      let shippingFields = null;
      shippingFields = fields.map((field, index) => {
          const fieldLabel = getFieldLabel(field);
          const fieldId = `shipping_address.${field.key}`;
          const fieldClassName = `${inputClassName} shipping-${field.key}`;
          const validate = field.required === true ? validateRequired : null;
          const countryView = (
              <div className={selectClassName}>
                <span className="select is-fullwidth">
                    <CountryList country={fieldId}/>
                </span>
              </div>
          )

          return (
                <div key={index}>
                  {field.key === 'residential' &&
                    <div className="columns" style={{marginBottom: '5px'}}>
                      <div className="column is-4">
                        <label>Is Residential</label>
                      </div>
                      <div className="column is-4">
                        <label><Field className="form-field-radio" name={fieldId} id={fieldId} component={inputField} type="radio" value="true" /> Yes</label>
                      </div>
                      <div className="column is-4">
                        <label><Field className="form-field-radio" name={fieldId} id={fieldId} component={inputField} type="radio" value="false" /> No</label>
                      </div>
                    </div>
                  }
                  {field.key === 'country' && <div>{countryView}</div>}
                  {field.key !== 'country' && field.key !== 'residential' &&
                    <Field
                      className={fieldClassName}
                      name={fieldId}
                      id={fieldId}
                      component={inputField}
                      type="text"
                      validate={validate}
                      placeholder={fieldLabel}
                    />
                  }
              </div>
            )
        })

      return (
        <div className="checkout-step">
          <h1><span>2</span>{this.props.title}</h1>

          <form onSubmit={handleSubmit(this.onSubmitWithoutLogin)}>

            {shippingFields}

            {!hideCommentsField && <div>
                <Field
                  className={inputClassName + ' shipping-comments'}
                  name="shipping_address.comments"
                  id="shipping_address.comments"
                  component={textareaField}
                  type="text"
                  placeholder={commentsFieldPlaceholder}
                  validate={commentsValidate}
                  rows="3"
                />
              </div>
            }

            {!hideBillingAddress &&
              <div>
                <h2>{text.billingAddress}</h2>
                <div className="billing-as-shipping">
                  <input id="billingAsShipping" type="checkbox" onChange={this.onChangeBillingAsShipping} checked={this.state.billingAsShipping} />
                  <label htmlFor="billingAsShipping">{text.sameAsShipping}</label>
                </div>

                {!this.state.billingAsShipping &&
                  <div>
                    <Field className={inputClassName + ' billing-fullname'} name="billing_address.full_name" id="billing_address.full_name" component={inputField} type="text" placeholder={text.fullName} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-address1'} name="billing_address.address1" id="billing_address.address1" component={inputField} type="text" placeholder={text.address1} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-city'} name="billing_address.city" id="billing_address.city" component={inputField} type="text" placeholder={text.city} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-state'} name="billing_address.state" id="billing_address.state" component={inputField} type="text" placeholder={text.state} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-postalcode'} name="billing_address.postal_code" id="billing_address.postal_code" component={inputField} type="text" placeholder={text.postal_code} validate={[validateRequired]}/>
                    <div className="columns" style={{marginBottom: '5px'}}>
                      <div className="column is-4">
                        <label>Is Residential</label>
                      </div>
                      <div className="column is-4">
                        <label><Field className="form-field-radio" name="billing_address.residential" id="billing_address.residential" component={inputField} type="radio" value="true" /> Yes</label>
                      </div>
                      <div className="column is-4">
                        <label><Field className="form-field-radio" name="billing_address.residential" id="billing_address.residential" component={inputField} type="radio" value="false" /> No</label>
                      </div>
                    </div>
                    <Field className={inputClassName + ' billing-country'} name="billing_address.country" id="billing_address.country" component={inputField} type="text" placeholder={text.country} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-phone'} name="billing_address.phone" id="billing_address.phone" component={inputField} type="text" placeholder={text.phone + ` (${text.optional})`}/>
                    <Field className={inputClassName + ' billing-company'} name="billing_address.company" id="billing_address.company" component={inputField} type="text" placeholder={text.company + ` (${text.optional})`}/>
                  </div>
                }
              </div>
            }

            <div className="checkout-button-wrap">
              {showPaymentForm &&
                <button
                  type="submit"
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.next}
                </button>
              }

            </div>
          </form>

        </div>
      )
    }
    else {
        let shippingFields = (
            <div className={openModal ? "modal is-active" : "modal"}>
              <div className="modal-content animate">
                <img onClick={this.closeForm} className="icon-close" src="/assets/images/close.svg" />
                <AddAddressForm />
              </div>
            </div>
        )

        let shippingAddress = null;
        if (user.shipping_addresses.length > 0 ){
            shippingAddress = user.shipping_addresses.map(address => {
                  const full_address = address.full_name + ", " + address.address1 + ", " + address.city + ", " + address.state + ", " + address.postal_code + ", " + address.country;
                  const full_address_withPhone = address.full_name + ", " + address.address1 + ", " + address.city + ", " + address.state + ", " + address.postal_code + ", "+ address.country + ", " + address.phone + ", " + address.residential;
                  return (
                          <div className="columns" key={address.id}>
                              <label>
                                  <input type="radio"
                                         value={full_address_withPhone}
                                         checked={full_address_withPhone === this.state.chosenAddress}
                                         onChange={this.setAddress} />{' '}
                                   {full_address}
                              </label>
                          </div>
                        )
                })
        }

        let defaultShipping = null;
        if (user && user.shipping_addresses.length > 0){
            if (defaultAddress === null){
                if (initialValues.shipping_address.full_name === ''){
                    defaultAddress = user.shipping_addresses.filter(element => element.default_shipping === true)[0];
                }
                else {
                    defaultAddress = initialValues.shipping_address;
                }
            }

            if (defaultAddress !== undefined && defaultAddress !== null) {
                defaultShipping = (
                  <div className="columns">
                    <div className="column is-8">
                      <strong>{defaultAddress.full_name}</strong>
                      <p>{defaultAddress.address1}</p>
                      <p>{defaultAddress.city}, {defaultAddress.state}, {defaultAddress.postal_code}, {defaultAddress.country}</p>
                      <p>{defaultAddress.phone}</p>
                    </div>
                    <div className="column is-4" style={{textAlign: 'right'}}>
                      <a onClick={this.openOption}>Change</a>
                    </div>
                  </div>
                )
            }
        }

        return (
           <div className="checkout-step">
                <h1><span>1</span>{this.props.title}</h1>
                {(user.shipping_addresses.length === 0) &&
                  <div>
                    <p>You do not have any shipping addresses.</p>
                    <button type="button" className="button is-info" onClick={this.openForm}>Add a new address</button>
                  </div>}

                {(!openOption) && <div>{defaultShipping}</div>}

                {(openOption) &&
                  <div className="columns">
                      <div className="column is-8">
                          <h2 style={{color: '#c45500'}}>Choose a shipping address</h2>
                      </div>
                      <div className="column is-4" style={{textAlign: 'right'}}>
                          <a onClick={this.closeOption}>Close</a>
                      </div>
                  </div>}

                {(openModal) ? <div>{shippingFields}</div> : null}

                {(openOption) &&
                    <div>
                       <div className="address-box">
                            {shippingAddress}
                            <div className="columns">
                                <img className="icon" src="/assets/images/addIcon.png" alt="add" style={{width: '20px', height: '20px'}} /><a onClick={this.openForm}> &nbsp; Add a new address</a>
                            </div>
                        </div>
                        <div className="address-box">
                            <button type="button" className="button is-info" onClick={this.useAddress}>Use this address</button>
                        </div>
                    </div>
                  }

                <form onSubmit={handleSubmit(this.onSubmit)} >
                {!hideBillingAddress &&
                    <div>
                        <h2>{text.billingAddress}</h2>
                        <div className="billing-as-shipping">
                          <input id="billingAsShipping" type="checkbox" onChange={this.onChangeBillingAsShipping} checked={this.state.billingAsShipping} />
                          <label htmlFor="billingAsShipping">{text.sameAsShipping}</label>
                        </div>

                        {!this.state.billingAsShipping &&
                          <div>
                              <Field className={inputClassName + ' billing-fullname'} name="billing_address.full_name" id="billing_address.full_name" component={inputField} type="text" placeholder={text.fullName} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-address1'} name="billing_address.address1" id="billing_address.address1" component={inputField} type="text" placeholder={text.address1} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-city'} name="billing_address.city" id="billing_address.city" component={inputField} type="text" placeholder={text.city} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-state'} name="billing_address.state" id="billing_address.state" component={inputField} type="text" placeholder={text.state} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-country'} name="billing_address.country" id="billing_address.country" component={inputField} type="text" placeholder={text.country} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-postalcode'} name="billing_address.postal_code" id="billing_address.postal_code" component={inputField} type="text" placeholder={text.postal_code} validate={[validateRequired]}/>
                              <Field className={inputClassName + ' billing-phone'} name="billing_address.phone" id="billing_address.phone" component={inputField} type="text" placeholder={text.phone + ` (${text.optional})`}/>
                              <Field className={inputClassName + ' billing-company'} name="billing_address.company" id="billing_address.company" component={inputField} type="text" placeholder={text.company + ` (${text.optional})`}/>
                          </div>}
                    </div>}
                  <hr />
                  <div className="checkout-button-wrap">
                      <button type="submit" className={buttonClassName}>{text.next}</button>
                  </div>
              </form>
           </div>
        )
     }
   }
}

export default reduxForm({form: 'CheckoutStepShipping', enableReinitialize: true, keepDirtyOnReinitialize: false})(CheckoutStepShipping)
