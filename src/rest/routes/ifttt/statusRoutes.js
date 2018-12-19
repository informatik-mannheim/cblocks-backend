class Routes {
  constructor(hapiServer, controller, validateHeaders) {
    this.hapiServer = hapiServer;
    this.controller = controller;
    this.validateHeaders = validateHeaders;
  }

  start() {
    this.hapiServer.route({
      'method': 'GET',
      'path': '/ifttt/v1/status',
      'handler': this.controller.getStatus.bind(this.controller),
      'options': {
        'validate': {
          'headers': this.validateHeaders,
        },
      },
    });
  }
}

module.exports = Routes;
