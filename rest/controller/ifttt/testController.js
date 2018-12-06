const examples = require('./testExamples.js');
const categoryMappingsStubs = require('../../../test/stubs/categoryMappings');

class Controller {
  constructor(recordResourceOutputUseCase, categoryMappingsUseCase) {
    this.recordResourceOutputUseCase = recordResourceOutputUseCase;
    this.categoryMappingsUseCase = categoryMappingsUseCase;
  }

  async postTestSetup(request, h) {
    try {
      await this._createNewSensorDataSamples();
      const categoryMappingID = await this._createCategoryMappingsSamples();

      examples.triggers.samples.new_category_mappings
        .mapping_id = categoryMappingID;

      return {
        'data': {
          'samples': {
            'triggers': examples.triggers.samples,
          },
        },
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async _createNewSensorDataSamples() {
    const ipso = {
      'objectID': examples.triggers.samples.new_sensor_data['object_id'],
      'instanceID': examples.triggers.samples.new_sensor_data['instance_id'],
      'resourceID': examples.triggers.samples.new_sensor_data['resource_id'],
    };

    const recordPromises = examples.triggers.data.new_sensor_data
      .map((value) => {
        return this.recordResourceOutputUseCase.record(ipso, value);
      });

    await Promise.all(recordPromises);
  }

  async _createCategoryMappingsSamples() {
    const m = await this.categoryMappingsUseCase.createMapping(
      categoryMappingsStubs.temperatureCategoryMapping);

    const recordPromises = examples.triggers.data.new_category_mappings
      .map((value) => {
        return this.categoryMappingsUseCase.applyMapping(m, value);
      });

    await Promise.all(recordPromises);

    await this.categoryMappingsUseCase.deleteMapping(m.mappingID);

    return m.mappingID;
  }
};

module.exports = Controller;
