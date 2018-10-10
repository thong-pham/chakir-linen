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
import ReviewProduct from './containers/reviewProduct'
import ReviewSuccess from './containers/reviewSuccess'
import AboutUs from './containers/aboutUs'
import TermsOfService from './containers/termsOfService'
import ShippingPolicy from './containers/shippingPolicy'
import ReturnPolicy from './containers/returnPolicy'

import {setCurrentPage, confirmEmail, fetchTokenAndUser, fetchCartById} from './actions'
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
          else if (paths.length > 2 && paths[1] === 'checkout'){
              var order_id = paths[2];
              this.props.updateCart(order_id);
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
    var orderId = '';
    var customerType = '';
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
        else if (paths.length > 2 && paths[1] === 'create-success'){
            customerType = paths[2];
            currentPage.type = PAGE;
            locationPathname = '/' + paths[1];
        }
        else if (paths.length > 2 && paths[1] === 'checkout'){
            currentPage.type = PAGE;
            locationPathname = '/' + paths[1];
        }
        else if (paths.length > 2) {
            locationPathname = '/' + paths[1] + '/' + paths[2];
        }
        else {
            locationPathname = '/' + paths[1];
        }

    }
    //console.log(locationPathname);
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
        else if(locationPathname === '/about-our-company'){
          return <AboutUs />;
        }
        else if(locationPathname === '/terms-of-service'){
          return <TermsOfService />;
        }
        else if(locationPathname === '/shipping-policy'){
          return <ShippingPolicy />;
        }
        else if(locationPathname === '/return-policy'){
          return <ReturnPolicy />;
        }
        else if(locationPathname === '/register'){
          return <CreateAccountContainer />;
        }
        else if(locationPathname === '/login'){
          return <LoginContainer />;
        }
        else if(locationPathname === '/user-account'){
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
        else if(locationPathname === '/products/review-your-purchases'){
            return <ReviewProduct />;
        }
        else if(locationPathname === '/checkout'){
            return <CheckoutContainer />;
        }
        else if(locationPathname === '/checkout-success'){
          return <CheckoutSuccessContainer />;
        }
        else if(locationPathname === '/products/review-success'){
          return <ReviewSuccess />;
        }
        else if(locationPathname === '/create-success'){
          return <CreateAccountSuccessContainer customerType={customerType} />;
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
    },
    updateCart: (order_id) => {
        dispatch(fetchCartById(order_id));
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
