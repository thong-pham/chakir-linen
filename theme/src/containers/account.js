import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

const AccountContainer = (props) => {

  const { pageDetails } = props.state;

  return (
    <Fragment>
      <MetaTags
        title={pageDetails.meta_title}
        description={pageDetails.meta_description}
        canonicalUrl={pageDetails.url}
        ogTitle={pageDetails.meta_title}
        ogDescription={pageDetails.meta_description}
      />

      <section className="section section-checkout">
        <div className="container">
          <div className="columns content">
              <div className="column is-4 is-offset-2">
                <NavLink to='/account/orders'>
                  <div className="checkout-box">
                    <div className="columns">
                      <div className="column is-3">
                          <img alt='Your Orders' src='/assets/images/orders2.jpg'/>
                      </div>
                      <div className="column is-9">
                          <h2>Your Orders</h2>
                          <p>Track, return and buy things again</p>
                      </div>
                    </div>
                  </div>
                </NavLink>
            </div>
            <div className="column is-4">
             <NavLink to='/account/userInfo'>
              <div className="checkout-box">
                <div className="columns">
                  <div className="column is-3">
                      <img alt='Login & Security' src='/assets/images/securities.png'/>
                  </div>
                  <div className="column is-9">
                      <h2>Login & Security</h2>
                      <p>Edit login, name and mobile number</p>
                  </div>
                </div>
              </div>
              </NavLink>
            </div>
          </div>
          <div className="columns content">
            <div className="column is-4 is-offset-2">
              <NavLink to='/account/addresses'>
                <div className="checkout-box">
                  <div className="columns">
                    <div className="column is-3">
                        <img alt='Your Addresses' src='/assets/images/addresses.png'/>
                    </div>
                    <div className="column is-9">
                        <h2>Your Addresses</h2>
                        <p>Edit addresses for orders</p>
                    </div>
                  </div>
                </div>
              </NavLink>
            </div>
            <div className="column is-4">
              <NavLink to='/account/payments'>
                <div className="checkout-box">
                  <div className="columns">
                    <div className="column is-3">
                        <img alt='Your Payments' src='/assets/images/payments2.png'/>
                    </div>
                    <div className="column is-9">
                        <h2>Payment Options</h2>
                        <p>Edit or add payment methods</p>
                    </div>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

    </Fragment>
  )
}

AccountContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default AccountContainer
