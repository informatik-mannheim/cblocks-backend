const examples = require('./testExamples.js');
const categoryMappingsStubs = require('../../../test/stubs/categoryMappings');
const labelMappingStubs = require('../../../test/stubs/labelMappings');

class Controller {
  constructor(recordResourceOutputUseCase, categoryMappingsUseCase, labelInputMappingsUseCase, labelOutputMappingsUseCase) {
    this.recordResourceOutputUseCase = recordResourceOutputUseCase;
    this.categoryMappingsUseCase = categoryMappingsUseCase;
    this.labelInputMappingsUseCase = labelInputMappingsUseCase;
    this.labelOutputMappingsUseCase = labelOutputMappingsUseCase;
  }

  async postTestSetup(request, h) {
    try {
      await this._createNewSensorDataSamples();
      const categoryMappingID = await this._createCategoryMappingsSamples();
      const labelMappingID = await this._createLabelMappingsSamples();

      examples.triggers.samples.new_category_mappings.mapping_id = categoryMappingID;
      examples.triggers.samples.new_label_mappings.mapping_id = labelMappingID;
      examples.actions.samples.label_mappings.mapping_id = labelMappingID;

      return {
        'data': {
          'samples': {
            'triggers': examples.triggers.samples,
            'actions': examples.actions.samples,
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
      this._createMapping(categoryMappingsStubs.temperatureCategoryMapping));

    const recordPromises = examples.triggers.data.new_category_mappings
      .map((value) => {
        return this.categoryMappingsUseCase.apply(m, value);
      });

    await Promise.all(recordPromises);

    await this.categoryMappingsUseCase.deleteMapping(m.mappingID);

    return m.mappingID;
  }

  _createMapping(m) {
    const r = JSON.parse(JSON.stringify(m));

    delete r._id;

    return r;
  }

  async _createLabelMappingsSamples() {
    const m = await this.labelInputMappingsUseCase.createMapping(
      this._createMapping(labelMappingStubs.ledLabelMapping));

    const recordOutputPromises = examples.triggers.data.new_label_mappings
      .map((value) => {
        return this.labelOutputMappingsUseCase.apply(m, value);
      });

    await this.labelInputMappingsUseCase.apply(m, examples.actions.samples.label_mappings.to);

    await Promise.all(recordOutputPromises);

    return m.mappingID;
  }
};

module.exports = Controller;
