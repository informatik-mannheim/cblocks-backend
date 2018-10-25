const wireCore = require('./core.js');
const wireDataProviders = require('./data-provider.js');
const wireMessaging = require('./messaging.js');
const wireRest = require('./rest.js');
const wireUseCases = require('./useCases.js');

module.exports = (mongoClient, mqttClient, db, hapiServer, request, iftttConfig) => {
  const core = wireCore();
  const dataProviders = wireDataProviders(db, core);
  iftttConfig = iftttConfig || {
    'service-key': 'test',
  };

  let messaging = {};
  messaging.outbound = wireMessaging.outbound(mqttClient);

  let rest = {};
  rest.outbound = wireRest.outbound(request, iftttConfig);

  const useCases = wireUseCases(
    messaging.outbound,
    rest.outbound,
    dataProviders,
    core
  );

  rest.inbound = wireRest.inbound(
    hapiServer,
    useCases,
    iftttConfig
  );

  messaging.inbound = wireMessaging.inbound(
    mqttClient,
    useCases
  );

  return {
    'core': core,
    'dataProviders': dataProviders,
    'messaging': messaging,
    'useCases': useCases,
    'rest': rest,
  };
};
