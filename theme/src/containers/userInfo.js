import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
//import * as helper from '../lib/helper'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

import AccountBreadcrumbs from '../components/accountBreadcrumbs'
import UserInfo from '../components/userInfo'

const UserInfoContainer = (props) => {

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
          <AccountBreadcrumbs path="/account/userInfo" name="Login & security"/>
          <div className="columns content">
            <div className="column is-4 is-offset-3">
                <h2>Login & Security</h2>
            </div>
            <div className="column is-4">

            </div>
          </div>
          <UserInfo {...props} />
        </div>
      </section>

    </Fragment>
  )
}

UserInfoContainer.propTypes = {
    state: PropTypes.shape({
        pageDetails: PropTypes.shape({})
    }).isRequired
}

export default UserInfoContainer
