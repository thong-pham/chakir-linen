import React from 'react'
import { themeSettings, text } from '../../lib/settings'
import * as helper from '../../lib/helper'

const FormattedCurrency = ({ number, settings }) => {
    return helper.formatCurrency(number, settings)
}

const ItemBulkPrice = ({ product, settings }) => {
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
  }
  // else if(product.on_sale) {
  //   return (
  //     <div className="product-price">
  //       <span className="product-new-price">
  //         <FormattedCurrency settings={settings} number={product.price} />
  //       </span>
  //       <del className="product-old-price">
  //         <FormattedCurrency settings={settings} number={product.regular_price} />
  //       </del>
  //     </div>
  //   )
  // }
  else {
    let QtyRow = null;
    let PriceRow = null;
    if (product && product.prices.length > 0){
        let prices = [];
        if (product.prices.length > 3){
            prices = product.prices.splice(0,3);
        }
        else {
            prices = product.prices;
        }
        const QtyUnit = prices.map((price,index) => <td key={index}>{price.quantity}</td>);
        const PriceUnit = prices.map((price,index) =>  <td key={index}><FormattedCurrency settings={settings} number={price.price} /></td>)
        QtyRow = (
            <tr>
              <td>Qty: </td>
              {QtyUnit}
            </tr>
        )
        PriceRow = (
            <tr>
              <td>Price: </td>
              {PriceUnit}
            </tr>
        )
    } else {
        QtyRow = (
            <tr>
              <td>Qty: </td>
              <td></td>
            </tr>
        )
        PriceRow = (
            <tr>
              <td>Price:</td>
              <td></td>
            </tr>
        )
    }

    return (
        <table>
          <tbody>
              {QtyRow}
              {PriceRow}
          </tbody>
        </table>
    )
  }
}

export default ItemBulkPrice
