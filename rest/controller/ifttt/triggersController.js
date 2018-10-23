const DEFAULT_LIMIT = 50;

class Controller {
  constructor(useCase) {
    this.useCase = useCase;
  }

  async postNewSensorData(request, h) {
    const ipso = this._getIpso(request.payload.triggerFields);
    const limit = this._getLimit(request.payload);

    return {
      'data': await this.useCase.getNewSensorData(ipso, limit),
    };
  }

  _getIpso(triggerFields) {
    return {
      'objectID': parseInt(triggerFields['object_id']),
      'instanceID': parseInt(triggerFields['instance_id']),
      'resourceID': parseInt(triggerFields['resource_id']),
    };
  }

  _getLimit(payload) {
    return parseInt(payload.limit) || DEFAULT_LIMIT;
  }
};

module.exports = Controller;
