module.exports = (useCase, renderError, mappingType, triggersController) => {
  const self = {};

  const _checkTriggerFields = (triggerFields) => {
    if (typeof triggerFields === 'undefined') {
      throw new Error('Please specify trigger fields.');
    }

    if (typeof triggerFields.mapping_id === 'undefined') {
      throw new Error('Please specify \'mapping_id\'.');
    }

    if (typeof triggerFields.to === 'undefined') {
      throw new Error('Please specify \'to\' value.');
    }
  };

  self.postNewMappings = async (request, h) => {
    try {
      _checkTriggerFields(request.payload.triggerFields);
      const limit = triggersController._getLimit(request.payload);
      const promises = [];

      promises.push(useCase.updateTriggerIdentity(
        `new_${mappingType}_mappings`,
        request.payload.trigger_identity
      ));

      const {mapping_id: mappingID, to} = request.payload.triggerFields;

      promises.push(useCase.getMappings(
        mappingID,
        to,
        limit
      ));

      const data = (await Promise.all(promises))[1].map(({mappingID, ...rest}) => ({
        'mapping_id': mappingID,
        ...rest,
      }));

      return {data};
    } catch (e) {
      const statusCode = 400;
      console.error(e);
      throw renderError(e, {statusCode});
    }
  };

  return self;
};
