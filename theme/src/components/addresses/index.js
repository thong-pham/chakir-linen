import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

class Addresses extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        mobileMenuIsActive: false,
        mobileSearchIsActive: false,
        arrange: null,
        openAddModal: false,
        openEditModal: false
      }
   }

   componentDidMount(){
       if (localStorage.getItem('token') === null){
           this.props.history.push('/login');
       }
       else {
           const { user } = this.props.state;
           if (user){
               this.props.fetchShippingAddress(user._id);
           }
           else {
               const userData = JSON.parse(localStorage.getItem('user'));
               this.props.fetchShippingAddress(userData._id);
           }
       }

   }

   openAddModal = () => {
      this.setState({openAddModal: true});
   }

   closeAddModal = () => {
      this.setState({openAddModal: false});
   }

   openEditModal = (id) => {
      this.props.editShippingAddress(id);
      this.setState({openEditModal: true});
   }

   closeEditModal = () => {
      this.setState({openEditModal: false});
   }

   triggerEdit = (id) => {
      this.setState({editAddress: id});
   }

   deleteAddress = (id) => {
       this.props.deleteAddress(id);
   }

   setAsDefault = (id) => {
        this.props.setDefaultShipping(id);
   }


   render(){

       const { location, user, token, shippingAddresses } = this.props.state;
       const { openAddModal, openEditModal } = this.state;
       const {addAddressForm, editAddressForm} = this.props;
       //console.log(shippingAddresses);
       var arrange = '';
       let addressView = "You have no address";
       if (shippingAddresses && shippingAddresses.length > 0){
          for (var i = 0; i < shippingAddresses.length; i++){
              if (i % 2 === 0){
                  shippingAddresses[i].className = 'column is-4 is-offset-2';
              }
              else {
                  shippingAddresses[i].className = 'column is-4';
              }
          }
          var finalAddresses = [];
          for (var i = 0; i < shippingAddresses.length/2; i++){
              var addressRow = [];
              for (var j = i*2; j < (i+1)*2; j++){
                  if(shippingAddresses[j]){
                      addressRow.push(shippingAddresses[j])
                  }
              }
              finalAddresses.push(addressRow);
          }
          //console.log(finalAddresses);
          addressView = finalAddresses.map((add,i) => {
                var addressRowView = add.map(address =>
                  <div key={address.id} className={address.className}>
                    <div className="checkout-box" style={address.default_shipping ? {border: '3px solid red'} : {}}>
                         <strong>{address.full_name}</strong>
                         <p>{address.address1}</p>
                         <p>{address.city}, {address.state}, {address.postal_code}</p>
                         <p>{address.country}</p>
                         <p>{address.phone}</p>
                       <button type="button" className="button is-info" onClick={() => this.openEditModal(address.id)}>Edit</button> &nbsp; &nbsp;
                       <button type="button" className="button is-info" onClick={() => this.deleteAddress(address.id)}>Delete</button> &nbsp; &nbsp;
                       {(!address.default_shipping) ? <button type="button" className="button is-info" onClick={() => this.setAsDefault(address.id)}>Set as Default</button> : null}
                    </div>
                  </div>
               );

              return ( <div key={i} className="columns">
                          {addressRowView}
                        </div>
                    )

             }
          )
       }

        return(
              <div>
                {addressView}
                <div className="column is-4" style={{textAlign: 'right'}}>
                    <button className="button is-success" onClick={this.openAddModal}><img className="icon" src="/assets/images/addIcon.png" alt="add" /> &nbsp; &nbsp; Add Address</button>
                </div>
                <div className={openAddModal ? "modal is-active" : "modal"}>
                  <div className="modal-content animate">
                    <img onClick={this.closeAddModal} className="icon-close" src="/assets/images/close.svg" />
                    {addAddressForm}
                  </div>
                </div>
                <div className={openEditModal ? "modal is-active" : "modal"}>
                  <div className="modal-content animate">
                    <img onClick={this.closeEditModal} className="icon-close" src="/assets/images/close.svg" />
                    {editAddressForm}
                  </div>
                </div>
              </div>
        )
    }
}

export default Addresses
