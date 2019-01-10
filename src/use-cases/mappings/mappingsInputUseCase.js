module.exports = (writer, makeMapping, mappingsUseCase) => {
  const self = {};

  self.apply = async (mapping, fromValue) => {
    const map = makeMapping(mapping);

    const toValue = map.apply(fromValue);

    await writer.write(mapping, toValue);
  }

  return Object.assign(self, mappingsUseCase);
}
