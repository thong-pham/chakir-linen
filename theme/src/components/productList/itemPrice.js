import React from 'react'
import { themeSettings, text } from '../../lib/settings'
import * as helper from '../../lib/helper'

const FormattedCurrency = ({ number, settings }) => {

    const price = helper.formatCurrency(number, settings)
    return (
        <div>
          <sup className="price-currency">{price.slice(0,1)}</sup>
          <span className="price-whole"><strong>{price.slice(1,3)}</strong></span>
          <sup className="price-fractional">{price.slice(4,6)}</sup>
        </div>
    )
}

const ItemPrice = ({ product, settings }) => {
  let priceStyle = {};
  if(themeSettings.list_price_size && themeSettings.list_price_size > 0){
    priceStyle.fontSize = themeSettings.list_price_size + 'px';
  }
  if(themeSettings.list_price_color && themeSettings.list_price_color.length > 0){
    priceStyle.color = themeSettings.list_price_color;
  }

  if(product.stock_status === 'discontinued') {
    return (
      <div className="product-price">
        {text.discontinued}
      </div>
    )
  } else if(product.stock_status === 'out_of_stock') {
    return (
      <div className="product-price">
        {text.outOfStock}
      </div>
    )
  } else if(product.on_sale) {
    return (
      <div className="product-price">
        <span className="product-new-price">
          <FormattedCurrency settings={settings} number={product.price} />
        </span>
        <del className="product-old-price">
          <FormattedCurrency settings={settings} number={product.regular_price} />
        </del>
      </div>
    )
  } else {
    return (
      <div className="product-price-large" style={priceStyle}>
        <FormattedCurrency settings={settings} number={product.price} />
      </div>
    )
  }
}

export default ItemPrice
