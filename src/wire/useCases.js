const ResourceWriteUseCase =
 require('../use-cases/resource-write/resourceWriteUseCase.js');
const CBlockUseCase = require('../use-cases/registry/cblockUseCase.js');
const mappingsUseCase = require(
  '../use-cases/mappings/mappingsUseCase.js');
const mappingsInputUseCase = require(
  '../use-cases/mappings/mappingsInputUseCase.js');
  const mappingsOutputUseCase = require(
    '../use-cases/mappings/mappingsOutputUseCase.js');
const RecordResourceOutputUseCase = require(
  '../use-cases/recordResourceOutputUseCase.js');
const makeTriggerIdentities = require('../use-cases/ifttt/triggers/triggerIdentities.js');
const makeNewSensorDataUseCase = require('../use-cases/ifttt/triggers/newSensorDataUseCase.js');
const makeIftttMappingsUseCase = require('../use-cases/ifttt/triggers/mappingsUseCase.js');

module.exports = (messaging, rest, dataProvider, core) => {
  const triggerIdentities = makeTriggerIdentities(dataProvider.triggersDataProvider);

  const result = {};

  result.resourceWriteUseCase = new ResourceWriteUseCase(
    dataProvider.registry, messaging.mqttWriter);

  result.cBlockUseCase = new CBlockUseCase(dataProvider.registry);

  const categoryMappingsUseCase = mappingsUseCase(
    dataProvider.categoryMappingsDataProvider,
    dataProvider.registry,
    core.entities.categoryMapping.make
  )

  const rangeMappingsUseCase = mappingsUseCase(
    dataProvider.rangeMappingsDataProvider,
    dataProvider.registry,
    core.entities.rangeMapping.makeOutput
  )

  const labelMappingsUseCase = mappingsUseCase(
    dataProvider.labelMappingsDataProvider,
    dataProvider.registry,
    core.entities.labelToValueMapping.make
  )

  result.mappings = {
    category: {
      manage: categoryMappingsUseCase,
      output: mappingsOutputUseCase(
        dataProvider.categoryMappingsOutputDataProvider, 
        core.entities.categoryMapping.make, 
        categoryMappingsUseCase)
    },
    range: {
      manage: rangeMappingsUseCase,
      input: mappingsInputUseCase(
        messaging.mqttMappingsWriter,
        core.entities.rangeMapping.makeInput,
        rangeMappingsUseCase),
      output: mappingsOutputUseCase(
        dataProvider.rangeMappingsOutputDataProvider, 
        core.entities.rangeMapping.makeOutput, 
        rangeMappingsUseCase)
    },
    label: {
      manage: labelMappingsUseCase,
      input: mappingsInputUseCase(
        messaging.mqttMappingsWriter,
        core.entities.labelToValueMapping.make,
        labelMappingsUseCase
      ),
      output: mappingsOutputUseCase(
        dataProvider.labelMappingsOutputDataProvider, 
        core.entities.valueToLabelMapping.make, 
        labelMappingsUseCase)
    }
  }

  result.recordResourceOutputUseCase = new RecordResourceOutputUseCase(
    dataProvider.resourceOutputDataProvider);

  result.triggers = {
    triggerIdentities,
    'newSensorDataUseCase': makeNewSensorDataUseCase(
      dataProvider.resourceOutputDataProvider,
      rest.ifttt.realTimeApi,
      triggerIdentities
    ),
    'categoryMappingsUseCase': makeIftttMappingsUseCase(
      dataProvider.categoryMappingsOutputDataProvider,
      'category',
      rest.ifttt.realTimeApi,
      triggerIdentities
    ),
    'labelMappingsUseCase': makeIftttMappingsUseCase(
      dataProvider.labelMappingsOutputDataProvider,
      'label',
      rest.ifttt.realTimeApi,
      triggerIdentities
    )
  };

  return result;
};
