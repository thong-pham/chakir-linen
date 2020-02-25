import React from 'react'
import messages from 'lib/text'
import CezerinClient from 'cezerin-client';
import settings from 'lib/settings';
import * as auth from 'lib/auth'
import axios from 'axios'

import RaisedButton from 'material-ui/RaisedButton'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField';

export default class LoginForm extends React.Component {

  state = {
      email: localStorage.getItem('dashboard_email') || '',
      password: '',
      isFetching: false,
      isAuthorized: false,
      error: null
  }

  handleChangeEmail = (e) => {
    this.setState({email: e.target.value});
  };

  handleChangePassword = (e) => {
    this.setState({password: e.target.value});
  };

  handleKeyPress = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      this.handleSubmit();
    }
  }

  handleSubmit = () => {
    this.setState({
      isFetching: true,
      isAuthorized: false,
      error: null
    });

    const data = {
        email: this.state.email,
        password: this.state.password
    }

    axios.post(settings.apiBaseUrl + '/systems/login', data)
        .then(response => {
            return response.data;
        })
        .then(data => {
            this.setState({isFetching: false, isAuthorized: true});
            auth.checkTokenFromLogIn(data.token);
        })
        .catch(error => {
            console.log(error);
            this.setState({isFetching: false, error: error.response.data.message});
        })
  }

  componentWillMount() {
    auth.checkTokenFromUrl();
  }
  componentDidMount() {}

  render() {
    const { email, password, isFetching, isAuthorized, emailIsSent, error } = this.state;

    let response = null;
    if(isFetching){
      response = <div className="loginSuccessResponse">{messages.messages_loading}</div>;
    } else if (emailIsSent) {
      response = <div className="loginSuccessResponse">{messages.loginLinkSent}</div>;
    } else if(emailIsSent === false && error) {
      response = <div className="loginErrorResponse">{error}</div>;
    }

    return (
      <div className="row col-full-height center-xs middle-xs">
        <div className="col-xs-12 col-sm-8 col-md-6 col-lg-4">
          <Paper className="loginBox" zDepth={1}>
            <div className="loginTitle">{messages.loginTitle}</div>
            <div className="loginDescription">{messages.loginDescription}</div>
            <div className="loginInput">
              <TextField
                type='email'
                value={email}
                onChange={this.handleChangeEmail}
                onKeyPress={this.handleKeyPress}
                label={messages.email}
                fullWidth={true}
                hintStyle={{width: '100%'}}
                hintText={messages.email}
              />
              <TextField
                type='password'
                value={password}
                onChange={this.handleChangePassword}
                onKeyPress={this.handleKeyPress}
                label={messages.password}
                fullWidth={true}
                hintStyle={{width: '100%'}}
                hintText={messages.password}
              />
            </div>
            <RaisedButton
              label={messages.loginButton}
              primary={true}
              disabled={isFetching || emailIsSent}
              onClick={this.handleSubmit}
            />
          </Paper>
          {response}
        </div>
      </div>
    );
  }
}
