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

      const promises = [];

      promises.push(this.useCase.updateTriggerIdentity(
        'new_sensor_data',
        request.payload.trigger_identity
      ));
      promises.push(this.useCase.getNewSensorData(ipso, limit));

      const data = (await Promise.all(promises))[1];

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

  async deleteTriggerIdentity(request, h) {
    try {
      const triggerName = request.params.triggerName;
      const triggerIdentity = request.params.triggerIdentity;

      await this.useCase.deleteTriggerIdentity(triggerName, triggerIdentity);

      return {message: 'Ok'};
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = Controller;
