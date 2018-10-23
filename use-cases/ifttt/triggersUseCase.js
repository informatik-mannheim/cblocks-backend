class TriggersUseCase {
  constructor(dataProvider) {
    this.dataProvider = dataProvider;
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
}

module.exports = TriggersUseCase;
