class Routes {
  constructor(hapiServer, controller) {
    this.hapiServer = hapiServer;
    this.controller = controller;
  }

  start() {
    this.hapiServer.route({
      'method': 'GET',
      'path': '/cblocks/{objectID?}',
      'handler': this.controller.handleGetCBlocks.bind(this.controller),
    });
  }
}

module.exports = Routes;
