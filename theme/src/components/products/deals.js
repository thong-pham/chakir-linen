import React from 'react'
import PropTypes from 'prop-types';
import { text } from '../../lib/settings'
import CustomProductList from './custom'

const Fragment = React.Fragment;

export default class DealProducts extends React.Component {
  static propTypes = {
		limit: PropTypes.number.isRequired,
		settings: PropTypes.shape({}).isRequired,
		addCartItem: PropTypes.func.isRequired
		//product: PropTypes.shape({}).isRequired
	};

  render() {
    const { limit, settings, addCartItem, hideDeal, userInfo } = this.props;
    return (
      <section className="section section-product-related section-gray" style={{paddingTop: '0px'}}>
        <div className="container border-section">
          <div className="title-section is-4 has-text-centered">{text.currentDeal}</div>
          <CustomProductList
            on_sale={true}
            settings={settings}
            addCartItem={addCartItem}
            hideDeal={hideDeal}
            limit={limit}
            isCentered
            userInfo={userInfo}
          />
        </div>
      </section>
    )
  }
}
