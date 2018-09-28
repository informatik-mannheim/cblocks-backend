const ResourceWriteUseCase =
 require('../use-cases/resource-write/resourceWriteUseCase.js');
const CBlockUseCase = require('../use-cases/registry/cblockUseCase.js');
const MappingsUseCase = require(
  '../use-cases/mappings/mappingsUseCase.js');

module.exports = (messaging, dataProvider, core) => {
  return {
    'resourceWriteUseCase': new ResourceWriteUseCase(
      dataProvider.registry, messaging.mqttWriter),
    'cBlockUseCase': new CBlockUseCase(dataProvider.registry),
    'categoryMappingsUseCase': new MappingsUseCase(
      dataProvider.categoryMappingsDataProvider,
      dataProvider.registry,
      core.entities.categoryMapping.make,
      null,
      core.entities.resource.make),
    'rangeMappingsUseCase': new MappingsUseCase(
      dataProvider.rangeMappingsDataProvider,
      dataProvider.registry,
      core.entities.rangeMapping.makeOutput,
      core.entities.rangeMapping.makeInput,
      core.entities.resource.make),
    'labelMappingsUseCase': new MappingsUseCase(
      dataProvider.labelMappingsDataProvider,
      dataProvider.registry,
      core.entities.valueToLabelMapping.make,
      core.entities.labelToValueMapping.make,
      core.entities.resource.make),
  };
};
