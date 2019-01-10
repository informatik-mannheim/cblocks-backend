module.exports = (hapiServer, controller, validateHeaders, mappingType) => {
  return {
    start: () => {
      hapiServer.route({
        'method': 'POST',
        'path': `/ifttt/v1/actions/${mappingType}_mappings`,
        'handler': controller.postMappings,
        'options': {
          'validate': {
            'headers': validateHeaders,
          },
        },
      });
    },
  };
};
