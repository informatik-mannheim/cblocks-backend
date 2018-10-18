const Registry = require('../data-provider/registry.js');
const MappingsDataProvider = require(
  '../data-provider/mappingsDataProvider.js');
const ResourceOutputDataProvider = require(
  '../data-provider/resourceOutputDataProvider.js');

module.exports = (db, core) => {
  let r = {};

  r.registry = new Registry(
    db.collection('registry'), core.entities.cblock.make);

  r.categoryMappingsDataProvider = new MappingsDataProvider(
    db.collection('category-mappings'));

  r.rangeMappingsDataProvider = new MappingsDataProvider(
    db.collection('range-mappings'));

  r.labelMappingsDataProvider = new MappingsDataProvider(
    db.collection('label-mappings')
  );

  r.resourceOutputDataProvider = new ResourceOutputDataProvider(
    db.collection('resource-outputs')
  );

  return r;
};
