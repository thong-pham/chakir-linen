import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'
import ReviewProduct from '../components/reviewProduct'

const OrdersContainer = (props) => {

  const { pageDetails, reviewItem } = props.state;

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
            <div className="column is-4 is-offset-3">
                <h2>Write your review</h2>
            </div>
            <div className="column is-4 is-offset-1">

            </div>
          </div>
          <div className="columns content">
              <div className="column is-6 is-offset-3 review-box">
                  <div className="columns">
                      <div className="column is-2" className="text-center">
                        <img className="imgSize" src={reviewItem.image_url} />
                      </div>
                      <div className="column is-10">
                        <p>{reviewItem.name} - {reviewItem.variant_name}</p>
                      </div>
                  </div>
              </div>
          </div>
          <div className="columns content">
              <ReviewProduct {...props} />
          </div>
        </div>
      </section>

    </Fragment>
  )
}

OrdersContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default OrdersContainer
