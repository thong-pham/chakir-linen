import React from 'react';
import Autosuggest from 'react-autosuggest'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

const searches = [
  {
    name: 'terry',
    rate: 1
  },
  {
    name: 'terry bathrobe',
    rate: 2
  },
  {
    name: 'terry shawl bathrobe',
    rate: 3
  },
  {
    name: 'terry bathrobe kimono',
  },
  {
    name: 'terry bathrobe hooded',
  },
  {
    name: 'waffle',
  },
  {
    name: 'waffle robe',
  },
  {
    name: 'waffle robe kimono',
  }
];

const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getSuggestions = value => {
  const escapedValue = escapeRegexCharacters(value.trim());

  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return searches.filter(search => regex.test(search.name));
};

const getSuggestionValue = suggestion => suggestion.name;

const renderSuggestion = suggestion => <span>{suggestion.name}</span>;

export default class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      hasFocus: false,
      suggestions: []
    };
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleSearch();
    }
  }

  handleKeyDown = (e) => {
    if (e.key === 'escape') {
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

  onChange = (event, { newValue }) => {
      this.setState({
        value: newValue
      });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const {hasFocus, suggestions, value} = this.state;
    const placeholderText = themeSettings.search_placeholder && themeSettings.search_placeholder.length > 0 ? themeSettings.search_placeholder : text.searchPlaceholder;
    const inputProps = {
        placeholder: "",
        type: 'text',
        value: value,
        onChange: this.onChange,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onKeyDown: this.handleKeyDown,
        onKeyPress: this.handleKeyPress
    };
    return <div className={'search-box ' + this.props.className + (hasFocus ? ' has-focus' : '')}>
      {/*<input
        className="search-input"
        type="text"
        placeholder={placeholderText}
        value={this.state.value}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />*/}
      <Autosuggest // eslint-disable-line react/jsx-no-undef
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        />
      <img className="search-icon-search" src="/assets/images/search.svg" alt={text.search} title={text.search} onClick={this.handleSearch}/>
      {this.state.value && this.state.value !== '' &&
        <img className="search-icon-clear" src="/assets/images/close.svg" onClick={this.handleClear} />
      }
    </div>
  }
}
