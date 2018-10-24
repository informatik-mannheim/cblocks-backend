const DEFAULT_LIMIT = 50;

class Controller {
  constructor(useCase, renderError) {
    this.useCase = useCase;
    this.renderError = renderError;
  }

  async postNewSensorData(request, h) {
    try {
      const ipso = this._getIpso(request.payload.triggerFields);
      const limit = this._getLimit(request.payload);

      const data = await this.useCase.getNewSensorData(ipso, limit);

      return {data};
    } catch (e) {
      const statusCode = 400;
      throw this.renderError(e, {statusCode});
    }
  }

  _getIpso(triggerFields) {
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
  }

  _getLimit(payload) {
    if (typeof payload.limit !== 'undefined') return parseInt(payload.limit);
    return DEFAULT_LIMIT;
  }
};

module.exports = Controller;
