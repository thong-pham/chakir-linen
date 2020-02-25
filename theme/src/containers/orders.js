import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

import Orders from '../components/orders'
import AccountBreadcrumbs from '../components/accountBreadcrumbs'
import SearchOrder from '../components/searchOrder'

const OrdersContainer = (props) => {

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
          <AccountBreadcrumbs path="/account/orders" name="Your Orders"/>
          <div className="columns content">
            <div className="column is-4 is-offset-2">
                <h2>Your Orders</h2>
            </div>
            <div className="column is-4 is-offset-1">
                <SearchOrder {...props}/>
            </div>
          </div>

          <Orders {...props} />

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
