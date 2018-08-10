import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { themeSettings, text } from '../lib/settings'
import MetaTags from '../components/metaTags'
import ProductDetails from '../components/productDetails'

const ProductContainer = (props) => {
  const {productDetails, settings, categories} = props.state;
  const {addCartItem, getJSONLD} = props;

  if (productDetails) {
    const images = productDetails.images;
    let imageUrl = images && images.length > 0 ? images[0].url : null;
    const title = productDetails.meta_title && productDetails.meta_title.length > 0 ? productDetails.meta_title : productDetails.name;
    const jsonld = getJSONLD(props.state);

    return (
      <Fragment>
        <MetaTags
          title={title}
          description={productDetails.meta_description}
          canonicalUrl={productDetails.url}
          imageUrl={imageUrl}
          ogType="product"
          ogTitle={productDetails.name}
          ogDescription={productDetails.meta_description}
          jsonld={jsonld}
        />

        <ProductDetails
          settings={settings}
          product={productDetails}
          addCartItem={addCartItem}
          categories={categories}
        />
      </Fragment>
    )
  }
  return null

}

ProductContainer.propTypes = {
    state: PropTypes.shape({
        setting: PropTypes.shape({}),
        productDetails: PropTypes.shape({}),
        categories: PropTypes.arrayOf(PropTypes.shape)
    }).isRequired,
    getJSONLD: PropTypes.func.isRequired,
    addCartItem: PropTypes.func.isRequired
}

export default ProductContainer
