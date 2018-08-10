import React from 'react'
import { Route } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { animateScroll } from 'react-scroll'

import IndexContainer from './containers/index'
import SharedContainer from './containers/shared'
import CategoryContainer from './containers/category'
import ProductContainer from './containers/product'
import PageContainer from './containers/page'
import CheckoutContainer from './containers/checkout'
import CheckoutSuccessContainer from './containers/checkoutSuccess'
import NotFoundContainer from './containers/notfound'
import SearchContainer from './containers/search'
import CreateAccountContainer from './containers/createAccount'
import CreateAccountSuccessContainer from './containers/createAccountSuccess'
import EmailConfirmContainer from './containers/emailConfirmation'
import LoginContainer from './containers/login'
import AccountContainer from './containers/account'
import OrdersContainer from './containers/orders'
import AddressContainer from './containers/addresses'
import UserInfoContainer from './containers/userInfo'

import {setCurrentPage, confirmEmail, fetchTokenAndUser} from './actions'
import {PAGE, PRODUCT_CATEGORY, PRODUCT, RESERVED, SEARCH} from './pageTypes'

class SwitchContainers extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    this.props.setCurrentPage(nextProps.location);

    if(nextProps.location && this.props.location){
      const pathnameChanged = nextProps.location.pathname !== this.props.location.pathname;
      const queryChanged = nextProps.location.search !== this.props.location.search;
      const isSearchPage = nextProps.location.pathname === '/search';

      if(pathnameChanged || (queryChanged && isSearchPage)){
        animateScroll.scrollToTop({
          duration: 500,
          delay: 100,
          smooth: true
        });
      }
    }
  }

  componentWillMount(){
      const page = this.props.currentPage;
      if (page.type === 'page'){
          var paths = page.path.split('/');
          if (paths.length > 2 && paths[2].includes('@')){
              var idParam = paths[2];
              //console.log(idParam);
              var data = {
                  email: idParam
              }
              this.props.confirmEmail(data);
          }
      }
  }

  componentDidMount(){
      this.props.fetchTokenAndUser();
  }

  render() {
    const { history, location, currentPage, token } = this.props;
    const path = location && location.pathname ? location.pathname : '/';
    var locationPathname = '';
    var paths = [];
    var idParam = '';
    if (path === '/'){
        locationPathname = '/';
    }
    else {
        paths = path.split('/');
        //console.log(paths);
        if (paths.length > 2 && paths[1] === 'email-confirm'){
            idParam = paths[2];
            currentPage.type = PAGE;
            locationPathname = '/' + paths[1];
        }
        else if (paths.length > 2) {
            locationPathname = '/' + paths[1] + '/' + paths[2];
        }
        else {
            locationPathname = '/' + paths[1];
        }

        if (paths[1] === 'create-success'){
            currentPage.type = PAGE;
        }
    }

    switch(currentPage.type){
      case PRODUCT:
        return <ProductContainer />;
      case PRODUCT_CATEGORY:
        return <CategoryContainer />;
      case SEARCH:
        return <SearchContainer />;
      case PAGE:
        if(locationPathname === '/'){
          return <IndexContainer />;
        }
        else if(locationPathname === '/register'){
          return <CreateAccountContainer />;
        }
        else if(locationPathname === '/login'){
          return <LoginContainer />;
        }
        else if(locationPathname === '/account-2'){
            if (token !== null){
                return <AccountContainer />;
            }
            else {
                history.push('/login');
            }
        }
        else if(locationPathname === '/account/orders'){
              return <OrdersContainer />;
        }
        else if(locationPathname === '/account/addresses'){
              return <AddressContainer />;
        }
        else if(locationPathname === '/account/userInfo'){
             return <UserInfoContainer />;
        }
        else if(locationPathname === '/checkout'){
            return <CheckoutContainer />;
        }
        else if(locationPathname === '/checkout-success'){
          return <CheckoutSuccessContainer />;
        }
        else if(locationPathname === '/create-success'){
          return <CreateAccountSuccessContainer />;
        }
        else if(locationPathname === '/email-confirm'){
          return <EmailConfirmContainer email={idParam} />;
        }
        else {
          return <PageContainer />;
        }
      default:
        return <NotFoundContainer />;
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    currentPage: state.app.currentPage,
    token: state.app.token
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setCurrentPage: (location) => {
      dispatch(setCurrentPage(location))
    },
    confirmEmail: (data) => {
        dispatch(confirmEmail(data))
    },
    fetchTokenAndUser: () => {
        dispatch(fetchTokenAndUser());
    }
  }
}

const SwitchContainersConnected = connect(mapStateToProps, mapDispatchToProps)(SwitchContainers);

const App = () => (
  <SharedContainer>
    <Route component={SwitchContainersConnected}/>
  </SharedContainer>
)

export default App
