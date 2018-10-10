'use strict';

const security = require('../lib/security');
const UsersService = require('../services/users/users');
const OrderItemsService = require('../services/orders/orderItems');
const OrdersService = require('../services/orders/orders');

class UsersRoute {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {

    this.router.get('/v1/users', security.checkUserScope.bind(this, security.scope.READ_USERS), this.getUsers.bind(this));
    this.router.post('/v1/users/create', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.addUser.bind(this));
    this.router.put('/v1/users/:user_id', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.updateUser.bind(this));
    this.router.delete('/v1/users/:user_id', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.deleteUser.bind(this));

    this.router.post('/v1/users/login', this.login.bind(this));
    this.router.post('/v1/users/confirmEmail', this.confirmEmail.bind(this));
    this.router.put('/v1/users/approve/:user_id', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.approveCustomer.bind(this));
    this.router.get('/v1/users/:user_id', security.checkUserScope.bind(this, security.scope.READ_USERS), this.getSingleUser.bind(this));

    this.router.put('/v1/users/:user_id/changePassword', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.changePassword.bind(this));
    this.router.post('/v1/users/:user_id/shipping_address', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.addShippingAddress.bind(this));
    this.router.put('/v1/users/:user_id/shipping_address/:address_id', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.updateShippingAddress.bind(this));
    this.router.get('/v1/users/:user_id/shipping_address', security.checkUserScope.bind(this, security.scope.READ_USERS), this.getShippingAddress.bind(this));
    this.router.delete('/v1/users/:user_id/shipping_address/:address_id', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.deleteShippingAddress.bind(this));
    this.router.put('/v1/users/:user_id/shipping_address/:address_id/default_shipping', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.setDefaultShipping.bind(this));
    this.router.put('/v1/users/:user_id/addCurrentOrder', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.addCurrentOrder.bind(this));
    this.router.get('/v1/users/:user_id/getCurrentOrder', security.checkUserScope.bind(this, security.scope.READ_USERS), this.getCurrentOrder.bind(this));

    this.router.post('/v1/systems/create', this.addSystemAccount.bind(this));
    this.router.post('/v1/systems/login', this.loginSystem.bind(this));
  }

  addUser(req, res, next) {
      const type = req.body.customerType;
      UsersService.addUser(req).then(data => {
          if (type === 'Reseller'){
                res.send(data);
          }
          else {
              UsersService.sendConfirmationEmail(req).then(emailConfirm => {
                  res.send(data);
              })
          }
      }).catch(next);
  }

  getUsers(req, res, next){
      UsersService.getUsers(req.query).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  login(req, res, next){
      UsersService.login(req.body).then(data => {
          if (req.body.order_id && data.user.currentOrderId !== null){
              OrderItemsService.addItemToCurrentOrder(data.user.currentOrderId, req.body.order_id).then(orderData => {
                  res.status(200).send({token: data.signedToken, user: data.user});
              });
          }
          else if (req.body.order_id) {
              const userInfo = {
                  firstName: data.user.firstName,
                  lastName: data.user.lastName,
                  email: data.user.email,
                  mobile: data.user.mobile
              }
              OrdersService.updateOrder(req.body.order_id, userInfo).then(orderData => {
                  res.status(200).send({token: data.signedToken, user: data.user});
              })
          }
          else {
              res.status(200).send({token: data.signedToken, user: data.user});
          }
      }).catch(next);
  }

  confirmEmail(req, res, next){
      UsersService.confirmEmail(req.body.email).then(data => {
         res.send(data);
      }).catch(next);
  }

  approveCustomer(req, res, next){
      const user_id = req.params.user_id;
      UsersService.approveCustomer(user_id).then(user => {
          req.email = user.value.email;
          UsersService.sendConfirmationEmail(req).then(data => {
              res.send(data);
          })
      })
  }

  getSingleUser(req, res, next){
      UsersService.getSingleUser(req.params.user_id).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  updateUser(req, res, next){
        UsersService.updateUser(req.params.user_id, req.body).then(data => {
            res.status(200).send(data)
        }).catch(next)
  }

  changePassword(req, res, next){
        UsersService.changePassword(req.params.user_id, req.body).then(data => {
            res.status(200).send(data);
        }).catch(next);
  }

  addShippingAddress(req, res, next){
      UsersService.addShippingAddress(req.params.user_id, req.body).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  updateShippingAddress(req, res, next){
      UsersService.updateShippingAddress(req.params.user_id, req.params.address_id, req.body).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  getShippingAddress(req, res, next){
      UsersService.getShippingAddress(req.params.user_id).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  deleteShippingAddress(req, res, next){
      UsersService.deleteShippingAddress(req.params.user_id, req.params.address_id).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  setDefaultShipping(req, res, next) {
    const user_id = req.params.user_id;
    const address_id = req.params.address_id;
    UsersService.setDefaultShipping(user_id, address_id).then(data => {
      res.status(200).send(data);
    }).catch(next);
  }

  addCurrentOrder(req, res, next) {
      const user_id = req.params.user_id;
      const order_id = req.body.order_id;
      UsersService.addCurrentOrder(user_id, order_id).then(data => {
          res.status(data ? 200 : 404).end();
      }).catch(next);
  }

  getCurrentOrder(req, res, next){
      const user_id = req.params.user_id;
      UsersService.getCurrentOrder(user_id).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  deleteUser(req, res, next) {
    UsersService.deleteUser(req.params.id).then(data => {
      res.status(data ? 200 : 404).end()
    }).catch(next);
  }

  addSystemAccount(req, res, next){
      UsersService.addSystemAccount(req.body).then(data => {
          res.status(data ? 200 : 404).end()
      }).catch(next);
  }

  loginSystem(req, res, next){
      UsersService.loginSystem(req.body).then(data => {
          res.status(200).send({token: data.signedToken, account: data.account})
      }).catch(next);
  }

}

module.exports = UsersRoute;
