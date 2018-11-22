module.exports = (useCase, renderError, triggersController) => {
  const self = {
    postNewSensorData: async (request, h) => {
      try {
        const ipso = triggersController._getIpso(request.payload.triggerFields);
        const limit = triggersController._getLimit(request.payload);

        const promises = [];

        promises.push(useCase.updateTriggerIdentity(
          'new_sensor_data',
          request.payload.trigger_identity
        ));

        promises.push(useCase.getNewSensorData(ipso, limit));

        const data = (await Promise.all(promises))[1];

        return {data};
      } catch (e) {
        const statusCode = 400;
        console.log(e);
        throw renderError(e, {statusCode});
      }
    },
  };

  return Object.assign(self, triggersController);
};
