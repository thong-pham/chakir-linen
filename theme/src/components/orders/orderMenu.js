import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

export default class OrderMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allOrdersActive: true,
      shippingOrdersActive: false,
      deliveredOrdersActive: false,
      cancelledOrdersActive: false,
      processingOrdersActive: false,
    }
  }

  orderNavigate = (type) => {

      this.props.orderNavigate(type);
      if (type === 'Orders'){
          this.setState({allOrdersActive: true, shippingOrdersActive: false, deliveredOrdersActive: false, cancelledOrdersActive: false, processingOrdersActive: false});
      }
      else if (type === 'Shipping Orders'){
          this.setState({allOrdersActive: false, shippingOrdersActive: true, deliveredOrdersActive: false, cancelledOrdersActive: false, processingOrdersActive: false});
      }
      else if (type === 'Delivered Orders'){
          this.setState({allOrdersActive: false, shippingOrdersActive: false, deliveredOrdersActive: true, cancelledOrdersActive: false, processingOrdersActive:false});
      }
      else if (type === 'Cancelled Orders'){
          this.setState({allOrdersActive: false, shippingOrdersActive: false, deliveredOrdersActive: false, cancelledOrdersActive: true, processingOrdersActive: false});
      }
      else if (type === 'Processing Orders'){
          this.setState({allOrdersActive: false, shippingOrdersActive: false, deliveredOrdersActive: false, cancelledOrdersActive: false, processingOrdersActive: true});
      }
  }

  render() {
    const { allOrdersActive, shippingOrdersActive, deliveredOrdersActive, cancelledOrdersActive, processingOrdersActive } = this.state;
    // const { categories, onClick, isMobile } = this.props;
    //
    // const menuItems = [...categories, ...addItemsToMenu];
    //
    // const items = menuItems.filter(category => category.parent_id === null).map((category, index) => (
    //   <HeadMenuItem key={index} category={category} onClick={onClick} categories={categories} level={1} isMobile={isMobile} />
    // ));

    return (
      <div className="tab">
        <button className={allOrdersActive ? 'active' : ''} onClick={() => this.orderNavigate('Orders')}>Orders</button>
        <button className={processingOrdersActive ? 'active' : ''} onClick={() => this.orderNavigate('Processing Orders')}>Processing Orders</button>
        <button className={shippingOrdersActive ? 'active' : ''} onClick={() => this.orderNavigate('Shipping Orders')}>Shipping Orders</button>
        <button className={deliveredOrdersActive ? 'active' : ''} onClick={() => this.orderNavigate('Delivered Orders')}>Delivered Orders</button>
        <button className={cancelledOrdersActive ? 'active' : ''} onClick={() => this.orderNavigate('Cancelled Orders')}>Cancelled Orders</button>
      </div>
    )
  }
}
