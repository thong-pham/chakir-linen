import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'
import axios from 'axios'
import countries from '../countries'


const validateRequired = value => value && value.length > 0 ? undefined : text.required;

const inputField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <input {...field.input} placeholder={field.placeholder} type={field.type} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}/>
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

class CheckoutShippingMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
      showShipping: false,
      shippingMethods: null,
      error: null
    };
  }

  getShippingMethods = () => {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': 'Basic YjNjMDYyMjU3ZDFlNGJlMDhlN2I5NjAzNTRlYzJiZTA6ODQwMzc5OWU5NWFmNDZmNDg5ZGZkMzZhOTZlMjdiNjU='
        }
        axios.get('https://private-anon-063d6fe4f2-shipstation.apiary-mock.com/carriers/listservices?carrierCode=fedex', {headers: headers})
            .then(function(response){
                return response.data;
            })
            .then(function(data){
                 console.log(data);
            })
            .catch(function(error){
                  const response = error.response;
                  throw response;
            })
  }

  getShippingRates = (rate) => {

        let country = '';
        for (const key in countries) {
            if (countries[key] === rate.country){
                country = key;
            }
        }
        let residential = null;
        if (rate.residential === 'true') residential = true;
        else if (rate.residential === 'false') residential = false;
        else residential = rate.residential;

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': 'Basic YjNjMDYyMjU3ZDFlNGJlMDhlN2I5NjAzNTRlYzJiZTA6ODQwMzc5OWU5NWFmNDZmNDg5ZGZkMzZhOTZlMjdiNjU='
        }
        const data = {
            carrierCode: rate.carrierCode,
            serviceCode: rate.serviceCode,
            packageCode: 'package',
            fromPostalCode: '92704',
            toState: rate.state,
            toCountry: country,
            toPostalCode: rate.zipcode,
            toCity: rate.city,
            weight: {
              value: rate.weight,
              units: 'lb'
            },
            confirmation: 'delivery',
            residential: residential
        };
        //console.log(data);
        return axios.post('https://ssapi.shipstation.com/shipments/getrates', data, {headers: headers})
        //return axios.post('https://private-anon-063d6fe4f2-shipstation.apiary-mock.com/shipments/getrates', data, {headers: headers})
            .then(function(response){
                return response.data;
            })
            .then(function(data){
                 //console.log(data);
                 if (data.length === 0) return 0;
                 return data[0].shipmentCost + data[0].otherCost;
            })
            .catch(function(error){
                  const response = error.response;
                  throw response;
            })
  }

  objectsAreSame(items1, items2) {
     if (items1.length !== items2.length) return false;
     for (var i = 0; i < items1.length; i++) {
        if (items1[i].quantity !== items2[i].quantity) {
           return false
        }
     }
     return true;
  }

  componentWillReceiveProps(nextProps) {
    const isSame = this.objectsAreSame(this.props.initialValues.items, nextProps.initialValues.items);
    const { initialValues } = nextProps;
    const shippingMethods = nextProps.shippingMethods ? nextProps.shippingMethods : this.state.shippingMethods;

    if(!isSame || this.props.show !== nextProps.show){
        this.setState({showShipping: false});
        if (shippingMethods && shippingMethods.length > 0){
            let list = [];
            let rate = null;
            let count = 0;
            shippingMethods.forEach((method) => {
                let totalWeight = 0;
                initialValues.items.forEach((item) => {
                    totalWeight += item.weight * item.quantity;
                });
                //console.log(totalWeight);
                rate = {
                    carrierCode: method.carrierCode,
                    serviceCode: method.serviceCode,
                    state: initialValues.shipping_address.state,
                    city: initialValues.shipping_address.city,
                    country: initialValues.shipping_address.country,
                    zipcode: initialValues.shipping_address.postal_code,
                    residential: initialValues.shipping_address.residential,
                    weight:  totalWeight
                }
                this.getShippingRates(rate).then(data => {
                    if (method.serviceCode === 'fedex_standard_overnight' || method.serviceCode === 'ups_2nd_day_air'){
                        method.price = data + Number(((data*10)/100).toFixed(Math.max(0, ~~ 2)));
                    }
                    else {
                        method.price = data + Number(((data*7)/100).toFixed(Math.max(0, ~~ 2)));
                    }
                    //method.price = data;
                    count += 1;
                    if (count === shippingMethods.length){
                         this.setState({showShipping: true, shippingMethods: shippingMethods});
                    }
                },this)
            })
          }
       }
  }

  componentDidMount() {
     this.props.onLoad();
     //this.getShippingMethods();
  }

  handleSave = () => {
    const { initialValues } = this.props;
    if (initialValues.shipping_method_id === null){
        this.setState({error: "Please select your shipping method!"});
    }
    else {
        this.setState({
          done: true
        });
        this.props.saveForm();
        this.props.onSave();
    }
  };

  handleEdit = () => {
    this.setState({
      done: false
    });
    this.props.onEdit();
  };

  render() {
    const {
      handleSubmit,
      pristine,
      invalid,
      valid,
      reset,
      submitting,
      processingCheckout,
      initialValues,
      loadingShippingMethods,
      saveShippingMethod,
      //shippingMethods,
      shippingMethod,
      checkoutFields,
      settings,
      finishCheckout,
      inputClassName,
      buttonClassName,
      editButtonClassName,
      user
    } = this.props;
    //console.log(shippingMethods);
    const hideBillingAddress = settings.hide_billing_address === true;
    //const { payment_method_gateway, grand_total } = initialValues;
    //const showPaymentForm = payment_method_gateway && payment_method_gateway !== '';
    const showPaymentForm = true;
    const { showShipping, shippingMethods, error } = this.state;

    let shippingView = <div>Loading Shipping Prices ...</div>;
    if (showShipping && shippingMethods && shippingMethods.length > 0){
       shippingView = shippingMethods.map((method, index) =>
           {
             if (method.price > 0) {
               return (
                   <label key={index} className={'shipping-method' + (method.id === initialValues.shipping_method_id ? ' active': '')}>
                        <Field
                          name="shipping_method_id"
                          component="input"
                          type="radio"
                          value={method.id}
                          onClick={() => saveShippingMethod(method.id, method.price)}
                        />
                        <div>
                          <div className="shipping-method-name">{method.name}</div>
                          <div className="shipping-method-description">{method.description}</div>
                        </div>
                          <span className="shipping-method-rate">{formatCurrency(method.price, settings)}</span>
                    </label>
                )
              } else {
                return null
              }
           }
        )
    }

    if(!this.props.show){
      return (
        <div className="checkout-step">
          <h1>{(user) ? <span>2</span> : <span>3</span>} {this.props.title}</h1>
        </div>
      )
    }
    else if(this.state.done){
      return (
        <div className="checkout-step">
          <h1>{(user) ? <span>2</span> : <span>3</span>} Shipping Method</h1>
          <div style={{textAlign: 'center'}}>
              <h3>{shippingMethod.name} ({formatCurrency(shippingMethod.price, settings)})</h3>
          </div>

          <div className="checkout-button-wrap">
            <button
              type="button"
              onClick={this.handleEdit}
              className={editButtonClassName}>
              {text.edit}
            </button>
          </div>

        </div> )

    }
    else {

      let errorView = null;
      if (error){
          errorView = (
              <div className="error-box">{error}</div>
          )
      }

      return (
        <div className="checkout-step">
          <h1>{(user) ? <span>2</span> : <span>3</span>} {this.props.title}</h1>

          <form onSubmit={handleSubmit}>

          <h2>{text.shippingMethods} {loadingShippingMethods && <small>{text.loading}</small>}</h2>
            <div className="shipping-methods">
              {shippingView}
            </div>

            <div className="checkout-button-wrap">
              {showPaymentForm &&
                <button
                  type="button"
                  onClick={this.handleSave}
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.next}
                </button>
              }

              {!showPaymentForm &&
                <button
                  type="button"
                  onClick={handleSubmit(data => {
                    finishCheckout(data)
                  })}
                  disabled={submitting || processingCheckout || invalid}
                  className={buttonClassName}>
                  {text.orderSubmit}
                </button>
              }

              {errorView}
            </div>
          </form>
        </div>
      )
    }
  }
}

export default reduxForm({form: 'CheckoutShippingMethod', enableReinitialize: true, keepDirtyOnReinitialize: false})(CheckoutShippingMethod)
