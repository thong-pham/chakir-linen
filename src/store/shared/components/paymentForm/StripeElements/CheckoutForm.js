import React from 'react';
import {injectStripe} from 'react-stripe-elements';
import CardSection from './CardSection';

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        inProgress: false
    }
  }

  handleSubmit = (ev) => {
    this.setState({inProgress: true});
    const { formSettings, onPayment, onCreateToken, stripe } = this.props;
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // tokenize, since there's only one in this group.
    stripe.createToken({name: formSettings.email}).then(({token}) => {
      if (token && token !== 'undefined') {
        onCreateToken(token);
      }
      else {
          this.setState({inProgress: false});
      }
    });



    // However, this line of code will do the same thing:
    //
    // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});

    // You can also use createSource to create Sources. See our Sources
    // documentation for more: https://stripe.com/docs/stripe-js/reference#stripe-create-source
    //
    // this.props.stripe.createSource({type: 'card', name: 'Jenny Rosen'});
  };

    render() {
  		const { inProgress } = this.state;
  		return (
  			<div>
  				<CardSection title="Credit Card details" />
  				<div className="checkout-button-wrap">
  					<button
  						onClick={this.handleSubmit}
  						disabled={inProgress}
  						className={`checkout-button button is-primary${
  							inProgress ? ' is-loading' : ''
  						}`}
  					>
  						Confirm order
  					</button>
  				</div>
  			</div>
  		);
  	}
}

export default injectStripe(CheckoutForm);
