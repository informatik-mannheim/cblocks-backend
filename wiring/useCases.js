const ResourceWriteUseCase =
 require('../use-cases/resource-write/resourceWriteUseCase.js');
const CBlockUseCase = require('../use-cases/registry/cblockUseCase.js');
const CategoryMappingsUseCase = require(
  '../use-cases/mappings/categoryMappingsUseCase.js');
const RangeMappingUseCase = require(
  '../use-cases/mappings/rangeMappingsUseCase.js');

module.exports = (messaging, dataProvider, core) => {
  return {
    'resourceWriteUseCase': new ResourceWriteUseCase(
      dataProvider.egistry, messaging.mqttWriter),
    'cBlockUseCase': new CBlockUseCase(dataProvider.registry),
    'categoryMappingsUseCase': new CategoryMappingsUseCase(
      dataProvider.categoryMappingsDataProvider, dataProvider.registry),
    'rangeMappingsUseCase': new RangeMappingUseCase(
      dataProvider.rangeMappingsDataProvider, dataProvider.registry,
      core.rangeMap),
  };
};
