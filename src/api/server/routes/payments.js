'use strict';

const PaymentGateways = require('../paymentGateways');
const security = require('../lib/security');

class PaymentsRoute {
  constructor(router) {
    this.router = router;
    this.registerRoutes();
  }

  registerRoutes() {
    this.router.post('/v1/payments/:gateway', security.checkUserScope.bind(this, security.scope.WRITE_ORDERS), this.processPayment.bind(this));
  }

  processPayment(req, res, next) {
    PaymentGateways.processPayment(req, res, req.params.gateway);
  }
}

module.exports = PaymentsRoute;
