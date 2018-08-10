import React from 'react'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'
import {Field, reduxForm} from 'redux-form'
import PaymentForm from '../paymentForm'

const validateRequired = value => value && value.length > 0 ? undefined : text.required;

export default class CheckoutStepPayment extends React.Component {
  render() {
    const {
      cart,
      settings,
      processingCheckout,
      finishCheckout,
      checkoutStripe,
      inputClassName,
      buttonClassName,
      paymentMethods,
      loadingPaymentMethods,
      savePaymentMethod
    } = this.props;

    const { payment_method_gateway, grand_total } = cart;

    if(!this.props.show){
      return (
        <div className="checkout-step">
          <h1><span>4</span>{this.props.title}</h1>
        </div>
      )
    } else {
      return (
        <div className="checkout-step">
          <h1><span>4</span>{this.props.title}</h1>
          <h2>{text.paymentMethods} {loadingPaymentMethods && <small>{text.loading}</small>}</h2>
          <div className="payment-methods">
            {paymentMethods.map((method, index) => <label key={index} className={'payment-method' + (method.id === cart.payment_method_id ? ' active': '')}>
                {/*<Field
                  name="payment_method_id"
                  validate={[validateRequired]}
                  component="input"
                  type="radio"
                  value={method.id}
                  onClick={() => savePaymentMethod(method.id)}
                />*/}
              <div>
                <div className="payment-method-name" onClick={() => savePaymentMethod(method.id)}>{method.name}</div>
                <div className="payment-method-description">{method.description}</div>
              </div>
              <span className="payment-method-logo"></span>
            </label>)}
          </div>

          <div className="checkout-button-wrap">
            {!processingCheckout &&
              <PaymentForm
                gateway={payment_method_gateway}
                amount={grand_total}
                shopSettings={settings}
                onPayment={finishCheckout}
                onCreateToken={checkoutStripe}
                inputClassName={inputClassName}
                buttonClassName={buttonClassName}
              />
            }
            {processingCheckout &&
              <p>{text.loading}</p>
            }
          </div>
        </div>
      )
    }
  }
}
