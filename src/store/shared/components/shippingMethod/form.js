import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'

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

class CheckoutShippingMethod extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false,
      showShipping: false
    };
  }

  getShippingMethods = () => {
      var request = new XMLHttpRequest();

      request.open('POST', 'https://ssapi.shipstation.com/shipments/getrates');
      request.setRequestHeader('Access-Control-Allow-Origin', '*');
      request.setRequestHeader('Access-Control-Allow-Headers', 'X-Requested-With, Origin, Accept, Content-Type, Authorization, X-Powered-By, Content-Length, Connection');
      request.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      request.setRequestHeader('Access-Control-Allow-Credentials', true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Authorization', 'Basic MmFlYTQ2NzliZjRhNGRlOGJlZDM5MmZiNTBkNDhkNDA6NDg5ZDYwY2RhMDY3NDJhYzhkODhjZGFkYTM0OTA3ZjA=');

      request.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
              var data = JSON.parse(this.responseText);
              console.log(data);
              //this.setState({shippingMethods: data});
          }
      };
      request.send();
  }

  getShippingRates = (data, callback) => {
      var request = new XMLHttpRequest();

      request.open('POST', 'https://ssapi.shipstation.com/shipments/getrates');
      request.setRequestHeader('Access-Control-Allow-Origin', '*');
      request.setRequestHeader('Access-Control-Allow-Headers', 'X-Requested-With, Origin, Accept, Content-Type, Authorization, X-Powered-By, Content-Length, Connection');
      request.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      request.setRequestHeader('Access-Control-Allow-Credentials', true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Authorization', 'Basic MmFlYTQ2NzliZjRhNGRlOGJlZDM5MmZiNTBkNDhkNDA6NDg5ZDYwY2RhMDY3NDJhYzhkODhjZGFkYTM0OTA3ZjA=');

      request.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
              var data = JSON.parse(this.responseText);
              callback(data[0].shipmentCost);
              //this.setState({shippingMethods: data});
          }
      };

        var body = {
          'carrierCode': data.carrierCode,
          'serviceCode': data.serviceCode,
          'packageCode': 'package',
          'fromPostalCode': '92704',
          'toState': data.state,
          'toCountry': 'US',
          'toPostalCode': data.zipcode,
          'toCity': data.city,
          'weight': {
            'value': data.weight,
            'units': 'lb'
          },
          'confirmation': 'delivery',
          'residential': false
      };

      request.send(JSON.stringify(body));
  }

    objectsAreSame(items1, items2) {
       var objectsAreSame = true;
       for (var i = 0; i < items1.length; i++) {
          if (items1[i].quantity !== items2[i].quantity) {
             objectsAreSame = false;
             break;
          }
       }
       return objectsAreSame;
    }

  componentWillReceiveProps(nextProps) {
    const isSame = this.objectsAreSame(this.props.initialValues.items, nextProps.initialValues.items);
    if(!isSame || this.props.show !== nextProps.show){
        this.setState({showShipping: false});
        const { shippingMethods, initialValues } = nextProps;
        if (shippingMethods !== undefined && shippingMethods.length > 0){
            let list = [];
            let rate = null;
            let finalCount = 0;
            let count = 0;
            shippingMethods.forEach((method) => {
                let total = 0;
                initialValues.items.forEach((item) => {
                    rate = {
                        carrierCode: method.carrierCode,
                        serviceCode: method.serviceCode,
                        state: initialValues.shipping_address.state,
                        city: initialValues.shipping_address.city,
                        country: initialValues.shipping_address.country,
                        zipcode: initialValues.shipping_address.postal_code,
                        weight:  item.weight
                    }
                    this.getShippingRates(rate, (data) => {
                         total = total + data;
                         count += 1;
                         if (count === initialValues.items.length){
                             //console.log(total);
                             method.price = total;
                             count = 0;
                             finalCount += 1;
                         }
                         if (finalCount === shippingMethods.length){
                              this.setState({showShipping: true});
                         }
                    },this)
                })
            })
        }
    }
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
      shippingMethods,
      shippingMethod,
      checkoutFields,
      settings,
      finishCheckout,
      inputClassName,
      buttonClassName,
      editButtonClassName
    } = this.props;
    //console.log(shippingMethods);
    const hideBillingAddress = settings.hide_billing_address === true;
    //const { payment_method_gateway, grand_total } = initialValues;
    //const showPaymentForm = payment_method_gateway && payment_method_gateway !== '';
    const showPaymentForm = true;

    let shippingView = <div>Loading Shipping Prices ...</div>;
    if (this.state.showShipping && shippingMethods && shippingMethods.length > 0){
       shippingView = shippingMethods.map((method, index) => <label key={index} className={'shipping-method' + (method.id === initialValues.shipping_method_id ? ' active': '')}>
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
        </label>)
    }

    if(!this.props.show){
      return (
        <div className="checkout-step">
          <h1><span>3</span>{this.props.title}</h1>
        </div>
      )
    }
    else if(this.state.done){
      return (
        <div className="checkout-step">
          <h1>Your shipping method is {shippingMethod.name}</h1>
        </div> )

    }
    else {

      return (
        <div className="checkout-step">
          <h1><span>3</span>{this.props.title}</h1>

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

            </div>
          </form>
        </div>
      )
    }
  }
}

export default reduxForm({form: 'CheckoutShippingMethod', enableReinitialize: true, keepDirtyOnReinitialize: false})(CheckoutShippingMethod)
