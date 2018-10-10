import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment';

import messages from 'lib/text'
import * as helper from 'lib/helper'
import style from './style.css'
import SummaryForm from './summaryForm.js'

import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import Dialog from 'material-ui/Dialog';

export default class CustomerBusiness extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSummaryEdit: false
    };
  }

  render() {
    const {customer, settings} = this.props;
    const inState = customer.inState ? "Yes" : "No";
    const license = customer.license ? "Yes" : "No";

    return (
      <Paper className="paper-box" zDepth={1}>
        <div className={style.innerBox}>
          <div className={style.customerName} style={{ paddingBottom:26, paddingTop:0 }}>
            {customer.businessName}
            <div><small>{customer.group_name}</small></div>
          </div>

          <div className={style.summaryRow + " row"}>
            <div className="col-xs-5"><span>{messages.businessPhone}</span></div>
            <div className="col-xs-7">{customer.businessPhone}</div>
          </div>

          <div className={style.summaryRow + " row"}>
            <div className="col-xs-5"><span>{messages.businessCategory}</span></div>
            <div className="col-xs-7">{customer.businessCategory}</div>
          </div>

          <div className={style.summaryRow + " row"}>
            <div className="col-xs-5"><span>{messages.inState}</span></div>
            <div className="col-xs-7">{inState}</div>
          </div>

          <div className={style.summaryRow + " row"}>
            <div className="col-xs-5"><span>{messages.license}</span></div>
            <div className="col-xs-7">{license}</div>
          </div>

        </div>
      </Paper>
    )
  }
}
