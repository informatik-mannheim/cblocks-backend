class Routes {
  constructor(hapiServer, controller, validateHeaders) {
    this.hapiServer = hapiServer;
    this.controller = controller;
    this.validateHeaders = validateHeaders;
  }

  start() {
    this.hapiServer.route({
      'method': 'POST',
      'path': '/ifttt/v1/triggers/new_sensor_data',
      'handler': this.controller.postNewSensorData.bind(this.controller),
      'options': {
        'validate': {
          'headers': this.validateHeaders,
        },
      },
    });

    this.hapiServer.route({
      'method': 'DELETE',
      'path': '/ifttt/v1/triggers/{triggerName}/trigger_identity/{triggerIdentity}',
      'handler': this.controller.deleteTriggerIdentity.bind(this.controller),
      'options': {
        'validate': {
          'headers': this.validateHeaders,
        },
      },
    });
  }
}

module.exports = Routes;
