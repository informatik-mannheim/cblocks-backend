module.exports = (hapiServer, controller, validateHeaders) => {
  return {
    start: () => {
      hapiServer.route({
        'method': 'POST',
        'path': '/ifttt/v1/triggers/new_sensor_data',
        'handler': controller.postNewSensorData,
        'options': {
          'validate': {
            'headers': validateHeaders,
          },
        },
      });
    },
  };
};
