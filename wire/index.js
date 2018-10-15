const wireCore = require('./core.js');
const wireDataProviders = require('./data-provider.js');
const wireMessaging = require('./messaging.js');
const wireRest = require('./rest.js');
const wireUseCases = require('./useCases.js');

module.exports = (mongoClient, mqttClient, db, hapiServer) => {
  const core = wireCore();
  const dataProviders = wireDataProviders(db, core);

  let messaging = {};
  messaging.outbound = wireMessaging.outbound(mqttClient);

  const useCases = wireUseCases(
    messaging.outbound,
    dataProviders,
    core
  );

  const rest = wireRest(
    hapiServer,
    useCases
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
