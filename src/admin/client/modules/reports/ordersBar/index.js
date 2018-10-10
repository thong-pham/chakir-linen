import React, { Component } from 'react'
import moment from 'moment'
import axios from 'axios'

import messages from 'lib/text'
import settings from 'lib/settings'
import BarChart from './barChart'
import * as utils from './utils'
import style from './style.css'

export default class OrdersBar extends Component {

  state = {
      ordersData: null,
      salesData: null
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const filter = {
      draft: false,
      cancelled: false,
      date_placed_min: moment().subtract(1, 'months').hour(0).minute(0).second(0).toISOString(true)
    };
    const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    const token = localStorage.getItem('dashboard_token');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + token
    }
    axios.get(settings.apiBaseUrl + "/orders?" + query, { headers: headers })
        .then(response => {
            //console.log(response);
            return response.data;
        })
        .then(data => {
            const reportData = utils.getReportDataFromOrders(data);
            const ordersData = utils.getOrdersDataFromReportData(reportData);
            const salesData = utils.getSalesDataFromReportData(reportData);
            this.setState({ ordersData, salesData });
        })
        .catch(error => {
            console.log(error.respone);
        })
  }

  render() {
    const { ordersData, salesData } = this.state;
    return (
      <div>
          {ordersData ? <BarChart
            data={ordersData}
            legendDisplay={true}
            title={messages.drawer_orders}
          /> : <div className={style.emptyData}>No Order Data</div>}
          {salesData ? <BarChart
            data={salesData}
            legendDisplay={false}
            title={messages.salesReport}
          /> : <div className={style.emptyData}>No Sales Data</div>}
      </div>
    )
  }
}
