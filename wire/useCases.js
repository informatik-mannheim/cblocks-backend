const ResourceWriteUseCase =
 require('../use-cases/resource-write/resourceWriteUseCase.js');
const CBlockUseCase = require('../use-cases/registry/cblockUseCase.js');
const MappingsUseCase = require(
  '../use-cases/mappings/mappingsUseCase.js');
const RecordResourceOutputUseCase = require(
  '../use-cases/recordResourceOutputUseCase.js');
const makeTriggerIdentities = require('../use-cases/ifttt/triggers/triggerIdentities.js');
const makeNewSensorDataUseCase = require('../use-cases/ifttt/triggers/newSensorDataUseCase.js');
const makeIftttMappingsUseCase = require('../use-cases/ifttt/triggers/mappingsUseCase.js');

module.exports = (messaging, rest, dataProvider, core) => {
  const triggerIdentities = makeTriggerIdentities(dataProvider.triggersDataProvider);

  return {
    'resourceWriteUseCase': new ResourceWriteUseCase(
      dataProvider.registry, messaging.mqttWriter),
    'cBlockUseCase': new CBlockUseCase(dataProvider.registry),
    'categoryMappingsUseCase': new MappingsUseCase(
      dataProvider.categoryMappingsDataProvider,
      dataProvider.registry,
      dataProvider.categoryMappingsOutputDataProvider,
      core.entities.categoryMapping.make,
      null),
    'rangeMappingsUseCase': new MappingsUseCase(
      dataProvider.rangeMappingsDataProvider,
      dataProvider.registry,
      dataProvider.rangeMappingsOutputDataProvider,
      core.entities.rangeMapping.makeOutput,
      core.entities.rangeMapping.makeInput),
    'labelMappingsUseCase': new MappingsUseCase(
      dataProvider.labelMappingsDataProvider,
      dataProvider.registry,
      dataProvider.categoryMappingsOutputDataProvider,
      core.entities.valueToLabelMapping.make,
      core.entities.labelToValueMapping.make),
    'recordResourceOutputUseCase': new RecordResourceOutputUseCase(
      dataProvider.resourceOutputDataProvider),
    'triggers': {
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
    },
  };
};
