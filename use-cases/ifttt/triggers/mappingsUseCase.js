module.exports = (dataProvider, mappingType, realTimeApi, triggerIdentities) => {
  let self = {};

  self.getMappings = async (mappingID, toValue, limit) => {
    const records = await dataProvider
      .getRecordsByTo(mappingID, toValue, limit);

    return records.map((x) => ({
      'created_at': new Date(x.timestamp).toISOString(),
      'from': x.from,
      'to': x.to,
      'mappingID': x.mappingID,
      'meta': {
        'id': x.id,
        'timestamp': x.timestamp,
      },
    }));
  };

  self.notify = async () => {
    const identities =
      await triggerIdentities.getTriggerIdentites(`new_${mappingType}_mappings`);

    await realTimeApi.notify(identities);
  };

  return Object.assign(self, triggerIdentities);
};
