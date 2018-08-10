import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

import Addresses from '../components/addresses'
import AccountBreadcrumbs from '../components/accountBreadcrumbs'
//import SearchBar from '../components/searchBar'

const AddressContainer = (props) => {

  const { pageDetails } = props.state;

  const {addAddressForm, editAddressForm} = props;

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
          <AccountBreadcrumbs path="/account/addresses" name="Your Addresses"/>
          <div className="columns content">
            <div className="column is-4 is-offset-2">
                <h2>Your Addresses</h2>
            </div>
            <div className="column is-4" style={{textAlign: 'right'}}>
                {/*<button className="button is-success"><img className="icon" src="/assets/images/addIcon.png" alt="add" /> &nbsp; &nbsp; Add Address</button>*/}
            </div>
          </div>

          <Addresses {...props} />

        </div>


      </section>

    </Fragment>
  )
}

AddressContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default AddressContainer
