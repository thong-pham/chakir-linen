import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

class OrderItem extends React.Component {

      constructor(props){
          super(props);
          this.state = {
              popup: false
          }
      }

      showPopUp = () => {
          this.setState({popup:true});
      }

      closePopUp = () => {
          this.setState({popup:false});
      }

      render () {
          const { popup } = this.state;
          const myPopup = false;
          const { order } = this.props;
          let orderView = null;

          if (order){

              let itemView = null;
              if (order.items.length > 0){
                  itemView = order.items.map(item =>
                      <div key={item.id} className="columns">
                        <div className="column is-3 imgAlign">
                            <NavLink to={item.path}><img className="imgSize" src={item.image}/></NavLink>
                            <span className="quantityBox">{item.quantity}</span>
                        </div>
                        <div className="column is-9">
                              <NavLink to={item.path}><p>{item.name}{(item.variant_name) ? <span> - {item.variant_name}</span> : null}</p></NavLink>
                              <p>${item.price}</p>
                              <button type="button" className="button is-rounded is-danger">Add To Cart</button>
                        </div>
                      </div>
                  )
              }

              orderView = (
                  <div className="checkout-box">
                      <div className="columns">
                          <div className="column is-2">
                              <h5>Order Placed</h5>
                              <h5>{order.date_created.slice(0,10)}</h5>
                          </div>
                          <div className="column is-2">
                              <h5>Total</h5>
                              <h5>${order.transactions[0].amount}</h5>
                          </div>
                          <div className="column is-2">
                              <h5>Ship To</h5>
                              <div className="popup" onMouseEnter={this.showPopUp} onMouseLeave={this.closePopUp}>
                                <h5 className="address">{order.shipping_address.full_name}</h5>
                                <span className={popup ? 'popuptext show' : 'popuptext'}>
                                  <strong>{order.shipping_address.full_name}</strong>
                                  <p>{order.shipping_address.address1}</p>
                                  <p>{order.shipping_address.city}, {order.shipping_address.state}, {order.shipping_address.postal_code}</p>
                                  <p>{order.shipping_address.country}</p>
                                  <p>{order.shipping_address.phone}</p>
                                </span>
                              </div>
                          </div>
                          <div className="column is-6">
                              <h5>Order # {order.number}</h5>
                          </div>
                      </div>
                      <hr />
                      <div className="columns">
                            <div className="column is-12">
                                <h4><strong>{order.status}</strong></h4>
                                {(order.status === 'Delivered') ? <p>Your package was delivered</p> : null}
                                {(order.status === 'Shipping') ? <p>Your package is being shipped</p> : null}
                                {(order.status === 'Processing') ? <p>Your order is being processed</p> : null}
                                {(order.status === 'Cancelled') ? <p>Your order was cancelled</p> :  null}
                            </div>
                      </div>
                      {itemView}
                  </div>
              )
          }

          return (
              <div>{orderView}<br></br></div>
          )
      }
}

class OrderList extends React.Component {

    constructor(props){
        super(props);
    }

    render(){

        const { orders } = this.props;

        let orderList = null;

        if (orders && orders.length > 0){
            orderList = orders.map(order =>
                <OrderItem key={order.id} order={order} />
            )
        }

        return (
            <ul>
              {orderList}
            </ul>
        )
    }
}

export default OrderList
