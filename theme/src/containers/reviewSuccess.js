import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'

const ReviewSuccessContainer = (props) => {

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
            <div className="column is-8 is-offset-2">
                <div className="success-box">
                  <img src="/assets/images/success.jpg" />
                  <p>Thank you for your review.</p>
                </div>
            </div>
          </div>
        </div>
      </section>

    </Fragment>
  )
}

ReviewSuccessContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default ReviewSuccessContainer
