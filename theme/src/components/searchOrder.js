import React from 'react';
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../lib/settings'

export default class SearchOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      hasFocus: false
    };
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleKeyPress = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      this.handleSearch();
    }
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      this.handleClear();
    }
  }

  handleSearch = () => {
    this.props.onSearch(this.state.value);
  }

  handleClear = () => {
    this.setState({value: ''});
    this.props.onSearch('');
  }

  handleFocus = () => {
    this.setState({hasFocus: true});
  }

  handleBlur = () => {
    this.setState({hasFocus: false});
  }

  render() {
    const {hasFocus} = this.state;
    const placeholderText = themeSettings.search_placeholder && themeSettings.search_placeholder.length > 0 ? themeSettings.search_placeholder : text.searchPlaceholder;

    return (
        <div className="info-field columns">
          <input type="text"
                placeholder="Search all orders"
                style={{width: '300px', marginRight: '10px', borderRadius: '5px', paddingLeft: '35px'}}
                value={this.state.value}
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                onKeyDown={this.handleKeyDown}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                />
          <img className="search-icon-order" src="/assets/images/search.svg" alt={text.search} title={text.search} />
          <button type="button" className="button is-black">Search Orders</button>
      </div>
     )
   }
}
