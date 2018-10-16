class Routes {
  constructor(hapiServer, controller) {
    this.hapiServer = hapiServer;
    this.controller = controller;
  }

  start() {
    this.hapiServer.route({
      'method': 'POST',
      'path': '/ifttt/v1/test/setup',
      'handler': this.controller.postTestSetup.bind(this.controller),
    });
  }
}

module.exports = Routes;
