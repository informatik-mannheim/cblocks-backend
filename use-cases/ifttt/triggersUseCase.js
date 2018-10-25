class TriggersUseCase {
  constructor(resourceOutputDataProvider, triggersDataProvider, realTimeApi) {
    this.resourceOutputDataProvider = resourceOutputDataProvider;
    this.triggersDataProvider = triggersDataProvider;
    this.realTimeApi = realTimeApi;
  }

  async getNewSensorData(ipso, limit) {
    const readings = await this.resourceOutputDataProvider
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
  }

  updateTriggerIdentity(triggerName, triggerIdentity) {
    return this.triggersDataProvider
      .updateTriggerIdentity(triggerName, triggerIdentity);
  }

  async notifyNewSensorData() {
    const triggerIdentities =
      await this._getTriggerIdentites('new_sensor_data');

    await this.realTimeApi.notifyNewSensorData(triggerIdentities);
  }

  async _getTriggerIdentites(triggerName) {
    const data = await this.triggersDataProvider
      .getTriggerIdentities(triggerName);

    return data.map((x) => x.triggerIdentity);
  }

  deleteTriggerIdentity(triggerName, triggerIdentity) {
    return this.triggersDataProvider.deleteTriggerIdentity(
      triggerName, triggerIdentity);
  }
}

module.exports = TriggersUseCase;
