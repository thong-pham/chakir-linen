import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'

const CreateAccountSuccessContainer = (props) => {

  const { pageDetails } = props.state;
  const { customerType } = props;

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
            <div className="column is-8 is-offset-2">
              <div className="checkout-box">
                {(customerType !== 'Reseller') ? <p>A confirmation email has been sent to your address. Please check your indox.</p> :
                <p>We will review your registration and send you a confirmation email</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

    </Fragment>
  )
}

CreateAccountSuccessContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default CreateAccountSuccessContainer
