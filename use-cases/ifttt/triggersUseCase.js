class TriggersUseCase {
  constructor(dataProvider, realTimeApi) {
    this.dataProvider = dataProvider;
    this.realTimeApi = realTimeApi;
  }

  async getNewSensorData(ipso, limit) {
    const readings = await this.dataProvider.getRecords(ipso, limit);

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
  }

  notifyNewSensorData() {
    return this.realTimeApi.notifyNewSensorData();
  }
}

module.exports = TriggersUseCase;
