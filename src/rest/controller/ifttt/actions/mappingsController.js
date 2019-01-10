module.exports = (useCase, renderError, uuid) => {
  const self = {};

  self.postMappings = async (request, h) => {
    try {
      const {'mapping_id': mappingID, from} = request.payload.actionFields;

      const mapping = await useCase.getMapping(mappingID);
      await useCase.apply(mapping, from);

      return {
        data: [{
          id: uuid()
        }]
      };
    } catch (e) {
      const statusCode = 400;
      console.error(e);
      throw renderError(e, {statusCode});
    }
  };

  return self;
};
