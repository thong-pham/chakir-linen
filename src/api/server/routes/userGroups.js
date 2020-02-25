'use strict';

const security = require('../lib/security');
const UserGroupsService = require('../services/users/userGroups');

class UserGroupsRoute {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.get('/v1/user_groups', security.checkUserScope.bind(this, security.scope.READ_USER_GROUPS), this.getGroups.bind(this));
    this.router.post('/v1/user_groups', security.checkUserScope.bind(this, security.scope.WRITE_USER_GROUPS), this.addGroup.bind(this));
    this.router.get('/v1/user_groups/:id', security.checkUserScope.bind(this, security.scope.READ_USER_GROUPS), this.getSingleGroup.bind(this));
    this.router.put('/v1/user_groups/:id', security.checkUserScope.bind(this, security.scope.WRITE_USER_GROUPS), this.updateGroup.bind(this));
    this.router.delete('/v1/user_groups/:id', security.checkUserScope.bind(this, security.scope.WRITE_USER_GROUPS), this.deleteGroup.bind(this));
  }

  getGroups(req, res, next) {
      UserGroupsService.getGroups(req.query).then(data => {
        res.send(data)
      }).catch(next);
  }

  getSingleGroup(req, res, next) {
    UserGroupsService.getSingleGroup(req.params.id).then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    }).catch(next);
  }

  addGroup(req, res, next) {
    UserGroupsService.addGroup(req.body).then(data => {
      res.send(data)
    }).catch(next);
  }

  updateGroup(req, res, next) {
    UserGroupsService.updateGroup(req.params.id, req.body).then(data => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    }).catch(next);
  }

  deleteGroup(req, res, next) {
    UserGroupsService.deleteGroup(req.params.id).then(data => {
      res.status(data
        ? 200
        : 404).end()
    }).catch(next);
  }
}

module.exports = UserGroupsRoute;
