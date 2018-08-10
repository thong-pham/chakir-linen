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
          const { user } = this.props.state;
          if (user){
              this.props.fetchOrders(user._id);
          }
          else {
              const userData = JSON.parse(localStorage.getItem('user'));
              this.props.fetchOrders(userData._id);
          }
      }      
   }

   orderNavigate = (type) => {
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

   menuClose = () => {
     this.setState({mobileMenuIsActive: false});
     document.body.classList.remove('noscroll');
   }


  render(){

       const { location, user, token, orders } = this.props.state;
       //console.log(orders);
       const { allOrdersActive, shippingOrdersActive, deliveredOrdersActive, cancelledOrdersActive, processingOrdersActive } = this.state;
       var allOrders = null;
       var shippingOrders = null;
       var deliveredOrders = null;
       var cancelledOrders = null;
       var processingOrders = null;
       if (orders){
          allOrders = orders.data;
          shippingOrders = orders.data.filter(order => order.status === 'Shipping');
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
                    <OrderList orders={allOrders}/>
                </div> : null}
                {(shippingOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={shippingOrders}/>
                </div> : null}
                {(deliveredOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={deliveredOrders}/>
                </div> : null}
                {(cancelledOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={cancelledOrders}/>
                </div> : null}
                {(processingOrdersActive) ? <div className="column is-9 is-offset-2">
                    <OrderList orders={processingOrders}/>
                </div> : null}
            </div>
          </div>
        )
    }
}

export default Orders
