module.exports = (dataProvider, makeMapping, mappingsUseCase) => {
  const self = {};

  self.apply = async (mapping, value) => {
    const map = makeMapping(mapping);
    const output = map.apply(value);

    await record(mapping.mappingID, value, output);

    return output;
  }

  const record = (mappingID, from, to) => {
    const timestampMs = Date.now();
    const timestamp = Math.round(timestampMs / 1000);
    const createdAt = new Date(timestampMs).toISOString();

    return dataProvider.record(mappingID, from, to, timestamp, createdAt);
  }

  return Object.assign(self, mappingsUseCase);
}
