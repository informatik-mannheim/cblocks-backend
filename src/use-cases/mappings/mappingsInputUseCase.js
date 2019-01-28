module.exports = (writer, makeMapping, mappingsUseCase) => {
  const self = {};

  self.apply = async (mapping, toValue) => {
    const map = makeMapping(mapping);

    const fromValue = map.apply(toValue);

    await writer.write(mapping, fromValue);
  };

  return Object.assign(self, mappingsUseCase);
};
