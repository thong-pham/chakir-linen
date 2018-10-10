import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

import OrderMenu from './orderMenu';
import OrderList from './orderList';

class Orders extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        mobileMenuIsActive: false,
        mobileSearchIsActive: false,
        cartIsActive: false,
        allOrdersActive: true,
        shippingOrdersActive: false,
        deliveredOrdersActive: false,
        cancelledOrdersActive: false,
        processingOrdersActive: false,
      }
   }

   componentDidMount(){
      if (localStorage.getItem('token') === null){
          this.props.history.push('/login');
      }
      else {
          const { userInfo } = this.props.state;
          if (userInfo){
              this.props.fetchOrders(userInfo.id);
          }
          else {
              const id = JSON.parse(localStorage.getItem('user_id'));
              this.props.fetchOrders(id);
          }
      }
   }

   orderNavigate = (type) => {
     if (type === 'Orders'){
         this.setState({allOrdersActive: true, shippingOrdersActive: false, deliveredOrdersActive: false, cancelledOrdersActive: false, processingOrdersActive: false});
     }
     else if (type === 'Shipped Orders'){
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

   menuClose = () => {
     this.setState({mobileMenuIsActive: false});
     document.body.classList.remove('noscroll');
   }


  render(){

       const { location, userInfo, token, orders } = this.props.state;
       const { reviewProduct } = this.props;
       //console.log(orders);
       const { allOrdersActive, shippingOrdersActive, deliveredOrdersActive, cancelledOrdersActive, processingOrdersActive } = this.state;
       var allOrders = null;
       var shippingOrders = null;
       var deliveredOrders = null;
       var cancelledOrders = null;
       var processingOrders = null;
       if (orders){
          allOrders = orders.data;
          shippingOrders = orders.data.filter(order => order.status === 'Shipped');
          deliveredOrders = orders.data.filter(order => order.status === 'Delivered');
          cancelledOrders = orders.data.filter(order => order.status === 'Cancelled');
          processingOrders = orders.data.filter(order => order.status === 'Processing');
       }
        return(
            <div>
              <div className="columns content">
                <div className="column is-9 is-offset-2">
                  <div className="primary-nav is-hidden-mobile">
                    <OrderMenu
                      location={location}
                      isMobile={false}
                      orderNavigate={this.orderNavigate}
                    />
                  </div>
              </div>
            </div>
            <div className="columns">
                {(allOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={allOrders} reviewProduct={reviewProduct}/>
                </div> : null}
                {(shippingOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={shippingOrders} reviewProduct={reviewProduct}/>
                </div> : null}
                {(deliveredOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={deliveredOrders} reviewProduct={reviewProduct}/>
                </div> : null}
                {(cancelledOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={cancelledOrders} reviewProduct={reviewProduct}/>
                </div> : null}
                {(processingOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={processingOrders} reviewProduct={reviewProduct}/>
                </div> : null}
            </div>
          </div>
        )
    }
}

export default Orders
