import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
//import { themeSettings, text } from '../lib/settings'
import MetaTags from '../components/metaTags'

const CreateAccountContainer = (props) => {
  const { pageDetails } = props.state;
  const { createAccountForm } = props;

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
            <div className="column is-12-widescreen is-12-desktop">
              {createAccountForm}
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  )
}

CreateAccountContainer.propTypes = {
	state: PropTypes.shape({
		pageDetails: PropTypes.shape({})
	}).isRequired
};

export default CreateAccountContainer
