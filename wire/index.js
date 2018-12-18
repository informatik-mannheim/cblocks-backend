const wireCore = require('./core.js');
const wireDataProviders = require('./data-provider.js');
const wireMessaging = require('./messaging.js');
const wireRest = require('./rest.js');
const wireUseCases = require('./useCases.js');

module.exports = (mongoClient, mqttClient, db, hapiServer, request, config) => {
  const core = wireCore();
  const dataProviders = wireDataProviders(db, core);

  let messaging = {};
  messaging.outbound = wireMessaging.outbound(mqttClient, config.messaging);

  let rest = {};
  rest.outbound = wireRest.outbound(request, config.ifttt);

  const useCases = wireUseCases(
    messaging.outbound,
    rest.outbound,
    dataProviders,
    core
  );

  rest.inbound = wireRest.inbound(
    hapiServer,
    useCases,
    config.ifttt
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
