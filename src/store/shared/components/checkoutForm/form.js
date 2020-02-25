import React from 'react'
import text from '../../text'
import CheckoutStepContacts from '../stepContacts'
import CheckoutStepShipping from '../stepShipping'
import CheckoutShippingMethod from '../shippingMethod'
import CheckoutStepPayment from '../stepPayment'


export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1
    };
  }

  componentDidMount() {
      const { user } = this.props;
      if (user){
          this.setState({step: 2});
          //this.props.onLoad(user.id);
      }
      else {
          const id = JSON.parse(localStorage.getItem('user_id'));
          if (id){
              this.setState({step: 2});
              this.props.onLoad(id);
          }
      }
  }

  handleContactsSave = () => {
    this.setState({
      step: 2
    });
  };

  handleContactsEdit = () => {
    this.setState({
      step: 1
    });
  };

  handleShippingSave = () => {
    this.setState({
      step: 3
    });
    this.props.hideQuantity();
  };

  handleShippingEdit = () => {
    this.setState({
      step: 2
    });
    this.props.showQuantity();
  };

  handleShippingMethodSave = () => {
    this.setState({
      step: 4
    });
  };

  handleShippingMethodEdit = () => {
    this.setState({
      step: 3
    });
  };

  nextStep = () => {
      this.setState({step: 2});
  }


  render() {
    var { step } = this.state;
    const { cart, settings, themeSettings, token, user } = this.props;
    const {
      checkoutInputClass = 'checkout-field',
      checkoutButtonClass = 'checkout-button',
      checkoutEditButtonClass = 'checkout-button-edit'
    } = themeSettings;

    if (user){
        if (step === 1){
            step = 2;
        }
    }
    if (cart && cart.items.length > 0) {
      //const { payment_method_gateway } = cart;
      //const showPaymentForm = payment_method_gateway && payment_method_gateway !== '';
      const showPaymentForm = true;

      return (
        <div className="checkout-form">
          {(!user) ? <CheckoutStepContacts
            show={step >= 1}
            onSave={this.handleContactsSave}
            onEdit={this.handleContactsEdit}
            title={text.customerDetails}
            inputClassName={checkoutInputClass}
            buttonClassName={checkoutButtonClass}
            editButtonClassName={checkoutEditButtonClass}
          /> : null}

          <CheckoutStepShipping
            show={step >= 2}
            onSave={this.handleShippingSave}
            onEdit={this.handleShippingEdit}
            title={text.shippingAddress}
            inputClassName={checkoutInputClass}
            buttonClassName={checkoutButtonClass}
            editButtonClassName={checkoutEditButtonClass}
          />

          <CheckoutShippingMethod
            show={step >= 3}
            onSave={this.handleShippingMethodSave}
            onEdit={this.handleShippingMethodEdit}
            title={text.shippingMethod}
            inputClassName={checkoutInputClass}
            buttonClassName={checkoutButtonClass}
            editButtonClassName={checkoutEditButtonClass}
          />

          {showPaymentForm &&
            <CheckoutStepPayment
              show={step === 4}
              title={text.payment}
              inputClassName={checkoutInputClass}
              buttonClassName={checkoutButtonClass}
            />
          }
        </div>
      )
    } else {
      return <p>{text.emptyCheckout}</p>
    }
  }
}
