module.exports = (hapiServer, controller, validateHeaders, mappingType) => {
  return {
    start: () => {
      hapiServer.route({
        'method': 'POST',
        'path': `/ifttt/v1/triggers/new_${mappingType}_mappings`,
        'handler': controller.postNewMappings,
        'options': {
          'validate': {
            'headers': validateHeaders,
          },
        },
      });
    },
  };
};
