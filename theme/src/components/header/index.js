import React from 'react'
import { NavLink } from 'react-router-dom'
import { themeSettings, text } from '../../lib/settings'

import Cart from './cart'
import CartIndicator from './cartIndicator'
import SearchBox from './searchBox'
import HeadMenu from './headMenu'

const Fragment = React.Fragment;

const Logo = ({ src, onClick, alt }) => (
  <NavLink className="logo-image" to="/" onClick={onClick}>
    <img src={src} alt={alt} />
  </NavLink>
)

const BurgerButton = ({ onClick, className }) => (
  <span className={className} onClick={onClick}>
    <span/>
    <span/>
    <span/>
  </span>
)

const BackButton = ({ onClick }) => (
  <span className="navbar-item is-hidden-tablet is-flex-mobile" onClick={onClick}>
    <img className="icon" src="/assets/images/arrow_back.svg" style={{ width: 18 }} />
  </span>
)

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileMenuIsActive: false,
      mobileSearchIsActive: false,
      cartIsActive: false
    }
  }

  componentDidMount () {
      const { user_id } = this.props.state;
      const order_id = localStorage.getItem('order_id');
      if (order_id){
          this.props.fetchCartById(order_id);
      }
      else if (user_id){
          this.props.fetchUserData(user_id);
          this.props.fetchCart(user_id);
      }
      else {
          const id = JSON.parse(localStorage.getItem('user_id'));
          if (id !== null){
              this.props.fetchUserData(id);
              this.props.fetchCart(id);
          }
      }
  }



  componentWillReceiveProps(nextProps) {
    if(this.props.state.cart !== nextProps.state.cart && this.props.state.currentPage.path !== '/checkout'){
      this.showCart();
    }
  }

  menuToggle = () => {
    this.setState({
      mobileMenuIsActive: !this.state.mobileMenuIsActive,
      cartIsActive: false
    });
    document.body.classList.toggle('noscroll');
  }

  searchToggle = () => {
    this.setState({
      mobileSearchIsActive: !this.state.mobileSearchIsActive
    });
    document.body.classList.toggle('search-active');
  }

  menuClose = () => {
    this.setState({mobileMenuIsActive: false});
    document.body.classList.remove('noscroll');
  }

  closeAll = () => {
    this.setState({
      cartIsActive: false,
      mobileMenuIsActive: false
    });
    document.body.classList.remove('noscroll');
  }

  cartToggle = () => {
    this.setState({
      cartIsActive: !this.state.cartIsActive,
      mobileMenuIsActive: false
    });
    document.body.classList.toggle('noscroll');
  }

  showCart = () => {
    this.setState({
      cartIsActive: true,
      mobileMenuIsActive: false
    });
    document.body.classList.add('noscroll');
  }

  handleSearch = search => {
    if(this.props.state.currentPage.path === '/search'){
      this.props.setSearch(search);
    } else {
      if(search && search !== ''){
        this.props.setLocation('/search?search=' + search);
      }
    }
  }

  handleGoBack = () => {
    this.closeAll();
    this.props.goBack();
  }

  createCookie(name,value,days) {
      var expires = "";
      if (days) {
          var date = new Date();
          date.setTime(date.getTime() + (days*24*60*60*1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + value + expires + "; path=/";
  }

  eraseCookie(name) {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  logOut = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      //console.log(document.cookie);
      //this.eraseCookie('order_id');
      this.props.logOut();
  }




  render() {
    const {categories, cart, settings, currentPage, location, productFilter, token, userInfo} = this.props.state;
    //console.log(userInfo);
    //const { token, user} = this.state;
    const classToggle = this.state.mobileMenuIsActive ? 'navbar-burger is-hidden-tablet is-active' : 'navbar-burger is-hidden-tablet';
    const showBackButton = currentPage.type === 'product' && location.hasHistory;
    const imgSrc = '/assets/images/' + settings.logo_file;

    return (
      <Fragment>
        <header className={this.state.mobileSearchIsActive ? 'search-active' : ''}>
          <div className="container">

            <div className="columns is-gapless is-mobile header-container">

              <div className="column is-4">
                {!showBackButton &&
                  <BurgerButton onClick={this.menuToggle} className={classToggle} />
                }
                {showBackButton &&
                  <BackButton onClick={this.handleGoBack} />
                }
                <Logo src={imgSrc} onClick={this.closeAll} alt="logo" />
              </div>

              <div className="column is-4 has-text-centered" style={{marginTop: '7px'}}>
                  <span className="icon icon-search is-hidden-tablet" onClick={this.searchToggle}>
                    <img src="/assets/images/search.svg" alt={text.search} title={text.search} style={{ minWidth: 24 }}/>
                  </span>
                  <SearchBox value={productFilter.search} onSearch={this.handleSearch} className={this.state.mobileSearchIsActive ? 'search-active' : ''} />
              </div>
              <div className="column is-4 has-text-right header-block-right">
                { (!token) ? <NavLink className="button is-success" to='/login'>Sign In</NavLink> :
                             <NavLink className="button is-info" to='/user-account'>
                                {(userInfo) && <p>Hello, {userInfo.firstName}</p>}
                            </NavLink> }
                 {(token) ? <button type="button" className="button is-black" onClick={this.logOut}>Log Out</button> : null}
                <CartIndicator cart={cart} onClick={this.cartToggle} cartIsActive={this.state.cartIsActive} />
                <div className={this.state.cartIsActive ? 'mini-cart-open' : ''}>
                  <Cart cart={cart} deleteCartItem={this.props.deleteCartItem} settings={settings} cartToggle={this.cartToggle} />
                </div>

              </div>
            </div>

            <div className="primary-nav is-hidden-mobile">
              <HeadMenu
                categories={categories}
                location={location}
                isMobile={false}
              />
            </div>

          </div>
        </header>

        <div className={(this.state.mobileMenuIsActive || this.state.cartIsActive ? 'dark-overflow' : '')} onClick={this.closeAll}></div>
        <div className={'mobile-nav is-hidden-tablet' + (this.state.mobileMenuIsActive ? ' mobile-nav-open' : '')}>
          <HeadMenu
            isMobile={true}
            categories={categories}
            location={location}
            onClick={this.menuClose}
          />
        </div>
    </Fragment>
    )
  }
}
