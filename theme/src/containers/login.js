import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
import MetaTags from '../components/metaTags'
import { NavLink } from 'react-router-dom'

const LoginContainer = (props) => {
  const { pageDetails } = props.state;
  const { loginForm } = props;

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
          <div className="columns columns-checkout">
            <div className="column is-6-widescreen is-6-desktop">
              {loginForm}
            </div>
            <div className="column is-6-widescreen is-6-desktop">
              <p>New to Chakir Hospitality?</p><hr />
              <NavLink to='/register'><button type="button" className="button is-info">Create your account</button></NavLink>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  )
}

LoginContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};


export default LoginContainer
