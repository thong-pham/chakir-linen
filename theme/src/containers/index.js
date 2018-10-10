import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { themeSettings, text } from '../lib/settings'
import MetaTags from '../components/metaTags'
import CategoryGallery from '../components/categoryGallery'
import CustomProducts from '../components/products/custom'
import ViewedProducts from '../components/products/viewed'
import DealProducts from '../components/products/deals'
import HomeSlider from '../components/homeSlider'

const IndexContainer = (props) => {
  const {pageDetails, categories, settings, userInfo, dealView=true} = props.state;
  const {addCartItem, hideDeal} = props;

  return (
    <Fragment>
      <MetaTags
        title={pageDetails.meta_title}
        description={pageDetails.meta_description}
        canonicalUrl={pageDetails.url}
        ogTitle={pageDetails.meta_title}
        ogDescription={pageDetails.meta_description}
      />

      <HomeSlider images={themeSettings.home_slider} />

      {pageDetails.content && pageDetails.content.length > 10 &&
        <section className="section">
          <div className="container">
            <div className="content">
              <div dangerouslySetInnerHTML={{
                __html: pageDetails.content
              }}/>
            </div>
          </div>
        </section>
      }

      <section className="section section-gray" style={{paddingTop: '20px'}}>
        <div className="container border-section">
          <div className="title-section is-4 has-text-centered">{themeSettings.home_products_title}</div>
          <CustomProducts
            sku={themeSettings.home_products_sku}
            sort={themeSettings.home_products_sort}
            limit={themeSettings.home_products_limit}
            settings={settings}
            addCartItem={addCartItem}
            userInfo={userInfo}
          />
        </div>
      </section>

      {themeSettings.show_viewed_products &&
        <ViewedProducts
          settings={settings}
          addCartItem={addCartItem}
          limit={themeSettings.limit_viewed_products || 4}
          userInfo={userInfo}
        />
      }

      { dealView &&
      <DealProducts
        settings={settings}
        addCartItem={addCartItem}
        hideDeal={hideDeal}
        limit={themeSettings.limit_deal_products || 4}
        userInfo={userInfo}
      />
    }




    </Fragment>
  )
}

IndexContainer.propTypes = {
    addCartItem: PropTypes.func.isRequired,
    state: PropTypes.shape({
        settings: PropTypes.shape({}),
        pageDetails: PropTypes.shape({})
    }).isRequired
}

export default IndexContainer
