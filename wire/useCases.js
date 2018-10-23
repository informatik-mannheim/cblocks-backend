const ResourceWriteUseCase =
 require('../use-cases/resource-write/resourceWriteUseCase.js');
const CBlockUseCase = require('../use-cases/registry/cblockUseCase.js');
const MappingsUseCase = require(
  '../use-cases/mappings/mappingsUseCase.js');
const RecordResourceOutputUseCase = require(
  '../use-cases/recordResourceOutputUseCase.js');
const TriggersUseCase = require('../use-cases/ifttt/triggersUseCase.js');

module.exports = (messaging, dataProvider, core) => {
  return {
    'resourceWriteUseCase': new ResourceWriteUseCase(
      dataProvider.registry, messaging.mqttWriter),
    'cBlockUseCase': new CBlockUseCase(dataProvider.registry),
    'categoryMappingsUseCase': new MappingsUseCase(
      dataProvider.categoryMappingsDataProvider,
      dataProvider.registry,
      core.entities.categoryMapping.make,
      null),
    'rangeMappingsUseCase': new MappingsUseCase(
      dataProvider.rangeMappingsDataProvider,
      dataProvider.registry,
      core.entities.rangeMapping.makeOutput,
      core.entities.rangeMapping.makeInput),
    'labelMappingsUseCase': new MappingsUseCase(
      dataProvider.labelMappingsDataProvider,
      dataProvider.registry,
      core.entities.valueToLabelMapping.make,
      core.entities.labelToValueMapping.make),
    'recordResourceOutputUseCase': new RecordResourceOutputUseCase(
      dataProvider.resourceOutputDataProvider),
    'triggersUseCase': new TriggersUseCase(
      dataProvider.resourceOutputDataProvider),
  };
};
