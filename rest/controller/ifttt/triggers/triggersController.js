const DEFAULT_LIMIT = 50;

module.exports = (useCase) => {
  return {
    _getIpso: (triggerFields) => {
      if (typeof triggerFields['object_id'] === 'undefined') {
        throw new Error('Please provide object_id.');
      }

      if (typeof triggerFields['instance_id'] === 'undefined') {
        throw new Error('Please provide instance_id.');
      }

      if (typeof triggerFields['resource_id'] === 'undefined') {
        throw new Error('Please provide resource_id.');
      }

      return {
        'objectID': parseInt(triggerFields['object_id']),
        'instanceID': parseInt(triggerFields['instance_id']),
        'resourceID': parseInt(triggerFields['resource_id']),
      };
    },
    _getLimit: (payload) => {
      if (typeof payload.limit !== 'undefined') return parseInt(payload.limit);
      return DEFAULT_LIMIT;
    },
    deleteTriggerIdentity: async (request, h) => {
      try {
        const triggerName = request.params.triggerName;
        const triggerIdentity = request.params.triggerIdentity;

        await useCase.deleteTriggerIdentity(triggerName, triggerIdentity);

        return {message: 'Ok'};
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
};
