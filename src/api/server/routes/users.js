'use strict';

const security = require('../lib/security');
const UsersService = require('../services/users/users');

class UsersRoute {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {

    this.router.post('/v1/users/create', security.checkUserScope.bind(this, security.scope.WRITE_USERS), this.addUser.bind(this));
    this.router.get('/v1/users', this.getUsers.bind(this));
    this.router.post('/v1/users/login', this.login.bind(this));
    this.router.post('/v1/users/confirmEmail', this.confirmEmail.bind(this));
    this.router.get('/v1/users/:user_id', this.getSingleUser.bind(this));
    this.router.put('/v1/users/:user_id', this.updateUser.bind(this));
    this.router.put('/v1/users/:user_id/changePassword', this.changePassword.bind(this));
    this.router.post('/v1/users/:user_id/shipping_address', this.addShippingAddress.bind(this));
    this.router.put('/v1/users/:user_id/shipping_address/:address_id', this.updateShippingAddress.bind(this));
    this.router.get('/v1/users/:user_id/shipping_address', this.getShippingAddress.bind(this));
    this.router.delete('/v1/users/:user_id/shipping_address/:address_id', this.deleteShippingAddress.bind(this));
    this.router.post('/v1/users/:user_id/shipping_address/:address_id/default_shipping', this.setDefaultShipping.bind(this));
  }

  addUser(req, res, next) {
      UsersService.addUser(req.body).then(data => {
          UsersService.sendConfirmationEmail(req).then(data => {
              res.send(data);
          })
      }).catch(next);
  }

  getUsers(req, res, next){
      UsersService.getUsers(req.query).then(data => {
          res.status(200).send(data);
      }).catch(next);
  }

  login(req, res, next){
      UsersService.login(req.body).then(data => {
          res.status(200).send({token: data.signedToken, user: data.user});
      }).catch(next);
  }

  confirmEmail(req, res, next){
      UsersService.confirmEmail(req.body.email).then(data => {
         res.send(data);
      }).catch(next);
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

}

module.exports = UsersRoute;
