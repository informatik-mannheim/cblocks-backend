module.exports = (resourceOutputDataProvider, realTimeApi, triggerIdentities) => {
  let self = {
    getNewSensorData: async (ipso, limit) => {
      const readings = await resourceOutputDataProvider
        .getRecords(ipso, limit);

      const readingsOutputFormat = readings.map((x) => {
        return {
          'object_id': ipso['objectID'],
          'instance_id': ipso['instanceID'],
          'resource_id': ipso['resourceID'],
          'value': x.value,
          'meta': {
            'id': x.id,
            'timestamp': x.timestamp,
          },
        };
      });

      return readingsOutputFormat;
    },
    notifyNewSensorData: async () => {
      const identities =
        await triggerIdentities.getTriggerIdentites('new_sensor_data');

      await realTimeApi.notifyNewSensorData(identities);
    },
  };

  return Object.assign(self, triggerIdentities);
};
