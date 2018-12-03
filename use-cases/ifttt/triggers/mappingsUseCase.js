module.exports = (dataProvider, realTimeApi, triggerIdentities) => {
  let self = {};

  self.getMappings = async (mappingID, toValue, limit) => {
    const records = await dataProvider
      .getRecordsByTo(mappingID, toValue, limit);

    return records.map((x) => ({
      'created_at': new Date(x.timestamp).toISOString(),
      'from': x.from,
      'to': x.from,
      'mappingID': x.mappingID,
      'meta': {
        'id': x.id,
        'timestamp': x.timestamp,
      },
    }));
  };

  return Object.assign(self, triggerIdentities);
};
