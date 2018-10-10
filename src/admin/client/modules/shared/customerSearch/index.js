import React from 'react'
import axios from 'axios'

import messages from 'lib/text'
import restApi from 'lib/restApi'
import * as helper from 'lib/helper'

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { fetchCustomers } from '../../customers/actions';

const SearchBox = ({ text, onChange }) => {
  return (
    <TextField
      fullWidth={true}
      floatingLabelText={messages.customers_search}
      onChange={onChange}
      value={text}
    />
  )
}

const SearchResult = ({ customers, selectedId, settings, onSelect }) => {
  const rows = customers.map((customer, index) => {
    const isSelected = customer.id === selectedId;

    return (
      <TableRow key={index} selected={isSelected}>
        <TableRowColumn>{customer.firstName} {customer.lastName}</TableRowColumn>
        <TableRowColumn>{customer.email}</TableRowColumn>
        <TableRowColumn>{customer.mobile}</TableRowColumn>
        <TableRowColumn>{customer.group_name}</TableRowColumn>
      </TableRow>
    )
  });

  return (
    <Table
      height='400px'
      selectable={true}
      multiSelectable={false}
      onRowSelection={onSelect}>
      <TableBody>
        {rows}
      </TableBody>
    </Table>
  )
}

export default class CustomerSearchDialog extends React.Component {

  state = {
      open: this.props.open,
      customers: [],
      search: '',
      selectedId: null,
      selectedCustomer: null
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.open !== nextProps.open) {
      this.setState({open: nextProps.open});
    }
  }

  handleCancel = () => {
      this.setState({open: false});
  }

  handleSubmit = () => {
      if(this.props.onSubmit) {
        this.props.onSubmit(this.state.selectedCustomer);
      }
  }

  handleRowSelection = (selectedRows) => {
    const { customers } = this.state;
    if(selectedRows && selectedRows.length > 0){
      const selectedIndex = selectedRows[0];
      const selectedCustomerId = customers && customers.length >= selectedIndex ? customers[selectedIndex].id : null;
      this.setState({
        selectedId: selectedCustomerId,
        selectedCustomer: customers[selectedIndex]
      });
    }
  };

  handleSearch = (event, value) => {
    this.setState({search: value});
    let filter = {
        limit: 50,
        offset: 0,
        search: value
    };
    const query = Object.keys(filter).map(key => key + '=' + filter[key]).join('&');
    axios.get(restApi.url + "/users?" + query, { headers : restApi.headers })
        .then(response => {
            return response.data;
        })
        .then(data => {
            this.setState({customers: data.data})
        })
        .catch(error => {
            console.log(error.response)
        });
  }

  render() {
    const { title, submitLabel, cancelLabel, modal = false, settings } = this.props;
    const { open, search, customers, selectedId } = this.state;
    const actions = [
      <FlatButton
        label={cancelLabel}
        onClick={this.handleCancel}
        style={{ marginRight: 10 }}
      />,
      <FlatButton
        label={submitLabel}
        primary={true}
        onClick={this.handleSubmit}
      />
    ];

    return (
        <Dialog
          title={title}
          actions={actions}
          actionsContainerStyle={{ borderTop: '1px solid rgb(224, 224, 224)' }}
          modal={modal}
          open={open}
          onRequestClose={this.handleCancel}
        >
          <div>
            <SearchBox text={search} onChange={this.handleSearch} />
            <SearchResult customers={customers} selectedId={selectedId} onSelect={this.handleRowSelection} settings={settings} />
          </div>
        </Dialog>
    )
  }
}
