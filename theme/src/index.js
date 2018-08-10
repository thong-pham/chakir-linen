export {updateThemeSettings} from './lib/settings'
export {default as SharedContainer} from './containers/shared'
export {default as IndexContainer} from './containers/index'
export {default as CategoryContainer} from './containers/category'
export {default as ProductContainer} from './containers/product'
export {default as NotFoundContainer} from './containers/notfound'
export {default as PageContainer} from './containers/page'
export {default as CheckoutContainer} from './containers/checkout'
export {default as CheckoutSuccessContainer} from './containers/checkoutSuccess'
export {default as CreateAccountSuccessContainer} from './containers/createAccountSuccess'
export {default as SearchContainer} from './containers/search'
export {default as CreateAccountContainer} from './containers/createAccount'
export {default as EmailConfirmContainer} from './containers/emailConfirmation'
export {default as LoginContainer} from './containers/login'
export {default as AccountContainer} from './containers/account'
export {default as OrdersContainer} from './containers/orders'
export {default as AddressContainer} from './containers/addresses'
export {default as UserInfoContainer} from './containers/userInfo'

// combine all css files into one with webpack. Hack to deal with server side rendering.
if(typeof window !== 'undefined'){
  require('../assets/css/theme.scss');
}
