import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'
import Field from './field'


const NameField = ({type, firstName, lastName, trackFirstName, trackLastName}) => {

    return (
      <div className="columns">
        <div className="column is-6">
          <div className="info-field" >
            <label>First Name</label>
            <input type={type} defaultValue={firstName} onChange={trackFirstName} />
          </div>
        </div>
        <div className="column is-6">
          <div className="info-field" >
            <label>Last Name</label>
            <input type={type} defaultValue={lastName} onChange={trackLastName} />
          </div>
        </div>
      </div>
    )
}

const EmailField = ({type, email, trackEmail, trackRetypeEmail, trackOldPassword}) => {

    return (
      <div>
        <p><strong>Your current email:</strong> {email}</p>
        <div className="columns">
          <div className="column is-6">
            <div className="info-field" >
              <label>New Email</label>
              <input type={type} onChange={trackEmail} />
            </div>
            <div className="info-field" >
              <label>Re-enter New Email</label>
              <input type={type} onChange={trackRetypeEmail} />
            </div>
          </div>
          <div className="column is-6">
            <div className="info-field" >
              <label>Password</label>
              <input type={type} onChange={trackOldPassword} />
            </div>
          </div>
        </div>
      </div>
    )
}

const MobileField = ({type, mobile, trackMobile}) => {

    return (
      <div className="info-field" >
        <input type={type} defaultValue={mobile} onChange={trackMobile} />
      </div>
    )
}

const PasswordField = ({type, trackOldPassword, trackNewPassword, trackRetypePassword}) => {

    return (
        <div className="columns">
          <div className="column is-6">
            <div className="info-field" >
              <label>Current Password</label>
              <input type={type} onChange={trackOldPassword} />
            </div>
          </div>
          <div className="column is-6">
            <div className="info-field" >
              <label>New Password</label>
              <input type={type} onChange={trackNewPassword} />
            </div>
            <div className="info-field" >
              <label>Re-enter New Password</label>
              <input type={type} onChange={trackRetypePassword} />
            </div>
          </div>
        </div>
    )
}

function validateEmail(email){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

class UserInfo extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          nameField: false,
          emailField: false,
          mobileField: false,
          passwordField: false,
          firstName: null,
          lastName: null,
          email: null,
          retypeEmail: null,
          mobile: null,
          oldPassword: null,
          newPassword: null,
          retypePassword: null,
          errorMessageName: null,
          errorMessageEmail: null,
          errorMessageMobile: null,
          errorMessagePassword: null,
          succesMessage: null
      }
   }

   componentDidMount(){
       if (localStorage.getItem('token') === null){
           this.props.history.push('/login');
       }
       else {
           const { user } = this.props.state;
           if (user){
               this.props.fetchUserData(user._id);
           }
           else {
               const userData = JSON.parse(localStorage.getItem('user'));
               this.props.fetchUserData(userData._id);
           }
       }
   }

   triggerName = () => {
      const { userInfo } = this.props.state;
      this.setState({nameField: true, emailField: false, mobileField: false, passwordField: false, firstName: userInfo.firstName, lastName: userInfo.lastName});
   }
   triggerEmail = () => {
      const { userInfo } = this.props.state;
      this.setState({nameField: false, emailField: true, mobileField: false, passwordField: false });
   }
   triggerMobile = () => {
      const { userInfo } = this.props.state;
      this.setState({nameField: false, emailField: false, mobileField: true, passwordField: false, mobile: userInfo.mobile});
   }
   triggerPassword = () => {
      const { userInfo } = this.props.state;
      this.setState({nameField: false, emailField: false, mobileField: false, passwordField: true});
   }

   closeEdit = () => {
      this.setState({nameField: false,
                    emailField: false,
                    mobileField: false,
                    passwordField: false,
                    firstName: null,
                    lastName: null,
                    email: null,
                    retypeEmail: null,
                    mobile: null,
                    oldPassword: null,
                    newPassword: null,
                    retypePassword: null,
                    errorMessageName: null,
                    errorMessageEmail: null,
                    errorMessageMobile: null,
                    errorMessagePassword: null });
   }

   trackFirstName = (e) => {
      this.setState({firstName: e.target.value})
   }

   trackLastName = (e) => {
      this.setState({lastName: e.target.value})
   }

   trackEmail = (e) => {
      this.setState({email: e.target.value})
   }

   trackRetypeEmail = (e) => {
      this.setState({retypeEmail: e.target.value})
   }

   trackMobile = (e) => {

      this.setState({mobile: e.target.value})
   }

   trackOldPassword = (e) => {
      this.setState({oldPassword: e.target.value})
   }

   trackNewPassword = (e) => {
      this.setState({newPassword: e.target.value})
   }

   trackRetypePassword = (e) => {
      this.setState({retypePassword: e.target.value})
   }

   saveName = () => {
       const firstName = this.state.firstName;
       const lastName = this.state.lastName;
       if (firstName === null || (firstName + "").trim() === ""){
           this.setState({errorMessageName: "Name cannot be empty"})
       }
       else if (lastName === null || (lastName + "").trim() === ""){
           this.setState({errorMessageName: "Name cannot be empty"})
       }
       else {
           const data = {firstName, lastName};
           this.props.saveUserData(data).then(data => {
               this.setState({succesMessage: "You have successfully modified your acount!"})
               this.closeEdit();
           },this);
       }
   }

   saveEmail = () => {
        const email = this.state.email;
        const retypeEmail = this.state.retypeEmail;
        const password = this.state.oldPassword;
        if (email === null || (email + "").trim() === "" || retypeEmail === null || (retypeEmail + "").trim() === ""){
            this.setState({errorMessageEmail: "Email cannot be empty"})
        }
        else if(!validateEmail(email) || !validateEmail(retypeEmail)){
            this.setState({errorMessageEmail: "Invalid Email"})
        }
        else if (email !== retypeEmail){
            this.setState({errorMessageEmail: "Email does not match"})
        }
        else if (password === null || (password + "").trim() === ""){
            this.setState({errorMessageEmail: "Password cannot be empty"})
        }
        else {
            const data = {email, password};
            this.props.saveUserData(data).then(data => {
                this.setState({succesMessage: "You have successfully modified your acount!"})
                this.closeEdit();
            },this);
        }

   }

   saveMobile = () => {
        const mobile = this.state.mobile;
        if (mobile === null || (mobile + "").trim() === ""){
            this.setState({errorMessageMobile: "Mobile number cannot be empty"})
        }
        else {
            const data = {mobile};
            this.props.saveUserData(data).then(data => {
                this.setState({succesMessage: "You have successfully modified your acount!"})
                this.closeEdit();
            },this);
        }
   }

   savePassword = () => {
        const oldPassword = this.state.oldPassword;
        const newPassword = this.state.newPassword;
        const retypePassword = this.state.retypePassword;
        if (oldPassword === null || (oldPassword + "").trim() === "" || newPassword === null || (newPassword + "").trim() === "" || retypePassword === null || (retypePassword + "").trim() === ""){
            this.setState({errorMessagePassword: "Password cannot be empty"})
        }
        else if (newPassword !== retypePassword){
             this.setState({errorMessagePassword: "Password does not match"});
        }
        else {
            const data = {oldPassword, newPassword};
            this.props.changePassword(data).then(data => {
                this.setState({succesMessage: "You have successfully modified your acount!"})
                this.closeEdit();
            },this);
        }
   }

  render(){

      const { location, user, token, userInfo, updatingUserError } = this.props.state;
      //console.log(updatingUserError);
      const { nameField, emailField, mobileField, passwordField, errorMessageName, errorMessageEmail, errorMessageMobile, errorMessagePassword, succesMessage } = this.state;
      let userView = null;
      let errorName = null;
      let errorEmail = null;
      let errorMobile = null;
      let errorPassword = null;
      let successView = null
      let updateFailView = null;
      if (errorMessageName) {
          errorName = (
              <div className="error-box">{errorMessageName}</div>
          )
      }
      else if (errorMessageEmail) {
          errorEmail = (
              <div className="error-box">{errorMessageEmail}</div>
          )
      }
      else if (errorMessageMobile) {
          errorMobile = (
              <div className="error-box">{errorMessageMobile}</div>
          )
      }
      else if (errorMessagePassword) {
          errorPassword = (
              <div className="error-box">{errorMessagePassword}</div>
          )
      }

      if (succesMessage) {
          successView = (
              <div className="success-box">
                <img src="/assets/images/success.jpg" />
                <p>{succesMessage}</p>
              </div>
          )
      }
      else if (updatingUserError){
          updateFailView = (
            <div className="fail-box">
              <img src="/assets/images/fail.jpg" />
              <p>{updatingUserError}</p>
            </div>
          )
      }

      if (userInfo) {
          userView = (
              <div className="column is-6 is-offset-3">
                {successView}
                {updateFailView}
                <div className="info-box">
                    <div className="columns">
                      <div className="column is-8">
                        <h4><strong>Name</strong></h4>
                        {(!nameField) ? <p>{userInfo.firstName} {userInfo.lastName}</p> :
                          <NameField type="text" firstName={userInfo.firstName} lastName={userInfo.lastName} trackFirstName={this.trackFirstName} trackLastName={this.trackLastName}/> }
                      </div>
                      <div className="column is-4" style={{textAlign: 'right'}}>
                        {(!nameField) && <button type="button" className="button is-light" onClick={this.triggerName}>Edit</button>}
                        {(nameField) && <div style={{paddingTop: '62px'}}><button type="button" className="button is-success" onClick={this.saveName}>Save</button> &nbsp; &nbsp;
                                              <button type="button" className="button is-black" onClick={this.closeEdit}>Close</button></div>}
                      </div>
                    </div>
                    {errorName}
                </div>
                <div className="info-box">
                  <div className="columns">
                    <div className="column is-8">
                      <h4><strong>Email</strong></h4>
                      {(!emailField) ? <p>{userInfo.email}</p> : <EmailField type="email" email={userInfo.email} trackEmail={this.trackEmail} trackRetypeEmail={this.trackRetypeEmail} trackOldPassword={this.trackOldPassword}/>}
                    </div>
                    <div className="column is-4" style={{textAlign: 'right'}}>
                      {(!emailField) && <button type="button" className="button is-light" onClick={this.triggerEmail}>Edit</button>}
                      {(emailField) && <div style={{paddingTop: '108px'}}><button type="button" className="button is-success" onClick={this.saveEmail}>Save</button> &nbsp; &nbsp;
                                            <button type="button" className="button is-black" onClick={this.closeEdit}>Close</button></div>}
                    </div>
                  </div>
                  {errorEmail}
                </div>
                <div className="info-box">
                  <div className="columns">
                    <div className="column is-8">
                      <h4><strong>Mobile Number</strong></h4>
                      {(!mobileField) ? <p>{userInfo.mobile}</p> : <MobileField type="tel" mobile={userInfo.mobile} trackMobile={this.trackMobile}/>}
                    </div>
                    <div className="column is-4" style={{textAlign: 'right'}}>
                      {(!mobileField) && <button type="button" className="button is-light" onClick={this.triggerMobile}>Edit</button>}
                      {(mobileField) && <div style={{paddingTop: '38px'}}><button type="button" className="button is-success" onClick={this.saveMobile}>Save</button> &nbsp; &nbsp;
                                            <button type="button" className="button is-black" onClick={this.closeEdit}>Close</button></div>}
                    </div>
                  </div>
                  {errorMobile}
                </div>
                <div className="info-box">
                  <div className="columns">
                    <div className="column is-8">
                      <h4><strong>Password</strong></h4>
                      {(!passwordField) ? <p>***************</p> :
                        <PasswordField type="password" trackOldPassword={this.trackOldPassword} trackNewPassword={this.trackNewPassword} trackRetypePassword={this.trackRetypePassword}/>}
                    </div>
                    <div className="column is-4" style={{textAlign: 'right'}}>
                        {(!passwordField) && <button type="button" className="button is-light" onClick={this.triggerPassword}>Edit</button>}
                        {(passwordField) && <div style={{paddingTop: '62px'}}><button type="button" className="button is-success" onClick={this.savePassword}>Save</button> &nbsp; &nbsp;
                                              <button type="button" className="button is-black" onClick={this.closeEdit}>Close</button></div>}
                    </div>
                  </div>
                  {errorPassword}
                </div>
                <div className="info-box">
                    <h4><strong>Advanced Security Setting</strong></h4>
                </div>
            </div>
          )
      }

      return (
            <div className="columns content">
               {userView}
           </div>
        )
    }
}



export default UserInfo
