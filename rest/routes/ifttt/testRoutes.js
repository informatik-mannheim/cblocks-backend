const compose = require('lodash/fp').compose;

class Routes {
  constructor(hapiServer, controller, validateHeaders) {
    this.hapiServer = hapiServer;
    this.controller = controller;
    this.validateHeaders = validateHeaders;
  }

  start() {
    this.hapiServer.route({
      'method': 'POST',
      'path': '/ifttt/v1/test/setup',
      'handler':
        compose(this.controller.postTestSetup.bind(this.controller), this.validateHeaders),
    });
  }
}

module.exports = Routes;
