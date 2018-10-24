const examples = require('./testExamples.js');

class Controller {
  constructor(recordResourceOutputUseCase) {
    this.recordResourceOutputUseCase = recordResourceOutputUseCase;
  }

  async postTestSetup(request, h) {
    const ipso = {
      'objectID': examples.triggers.samples.new_sensor_data['object_id'],
      'instanceID': examples.triggers.samples.new_sensor_data['instance_id'],
      'resourceID': examples.triggers.samples.new_sensor_data['resource_id'],
    };

    const recordPromises = examples.triggers.readings.map((value) => {
      return this.recordResourceOutputUseCase.record(ipso, value);
    });

    await Promise.all(recordPromises);

    return {
      'data': {
        'samples': {
          'triggers': examples.triggers.samples,
        },
      },
    };
  }
};

module.exports = Controller;
