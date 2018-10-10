import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { fetchOrder, updateOrder, deleteOrderItem, updateOrderItem, updateShippingAddress,
         updateBillingAddress, clearOrderDetails, checkoutOrder, addCustomerForOrder } from '../actions'
import OrderDetails from './components/details'

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.settings.settings,
    order: state.orders.editOrder,
    processingCheckout: state.orders.processingCheckout
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchData: () => {
        const { orderId } = ownProps.match.params;
        dispatch(fetchOrder(orderId));
    },
    clearData: () => {
        dispatch(clearOrderDetails());
    },
    onItemDelete: (itemId) => {
        const { orderId } = ownProps.match.params;
        dispatch(deleteOrderItem(orderId, itemId));
    },
    onItemUpdate: (itemId, quantity, variantId, itemPrice) => {
        const { orderId } = ownProps.match.params;
        dispatch(updateOrderItem(orderId, itemId, quantity, variantId, itemPrice));
    },
    onShippingAddressUpdate: (address) => {
        const { orderId } = ownProps.match.params;
        dispatch(updateShippingAddress(orderId, address));
    },
    onBillingAddressUpdate: (address) => {
        const { orderId } = ownProps.match.params;
        dispatch(updateBillingAddress(orderId, address));
    },
    onOrderSummaryUpdate: (order) => {
      const { orderId } = ownProps.match.params;
      dispatch(updateOrder({
        id: order.id,
        tracking_number: order.tracking_number,
        status_id: order.status_id,
        shipping_method_id:  order.shipping_method_id,
        payment_method_id: order.payment_method_id,
        comments: order.comments,
        note: order.note
      }));
    },
    updateCustomerInfo: (customer, orderId) => {
        let shipping_address = null;
        if (customer.shipping_addresses && customer.shipping_addresses.length > 0){
            customer.shipping_addresses.forEach(address => {
                if (address.default_shipping === true){
                    shipping_address = {
                        full_name: address.full_name,
                        address1: address.address1,
                        city: address.city,
                        state: address.state,
                        country: address.country,
                        postal_code: address.postal_code,
                        phone: address.phone
                    };
                }
            })
        }
        const data = {
            id: orderId,
            userInfo: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                mobile: customer.mobile,
                user_id: customer.id
            },
            shipping_address: shipping_address
        }
        dispatch(addCustomerForOrder(data));
    },
    onCheckout: () => {
      const { orderId } = ownProps.match.params;
      dispatch(checkoutOrder(orderId));
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OrderDetails));
