module.exports = (hapiServer, controller, validateHeaders) => {
  return {
    start: () => {
      hapiServer.route({
        'method': 'DELETE',
        'path': '/ifttt/v1/triggers/{triggerName}/trigger_identity/{triggerIdentity}',
        'handler': controller.deleteTriggerIdentity,
        'options': {
          'validate': {
            'headers': validateHeaders,
          },
        },
      });
    },
  };
};
