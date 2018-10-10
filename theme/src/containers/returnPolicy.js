import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

const ReturnPolicyContainer = (props) => {

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
                  <div className="checkout-box">
                    <h1>{pageDetails.meta_title}</h1>
                    <div className="product-content" dangerouslySetInnerHTML={{__html: pageDetails.content}} />
                </div>
            </div>
          </div>
        </div>
      </section>

    </Fragment>
  )
}

ReturnPolicyContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default ReturnPolicyContainer
