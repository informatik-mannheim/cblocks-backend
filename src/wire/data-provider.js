const Registry = require('../data-provider/registry.js');
const MappingsDataProvider = require(
  '../data-provider/mappingsDataProvider.js');
const ResourceOutputDataProvider = require(
  '../data-provider/resourceOutputDataProvider.js');
const MappingsOutputDataProvider = require(
  '../data-provider/mappingsOutputDataProvider.js');
const TriggersDataProvider = require(
  '../data-provider/triggersDataProvider.js');

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

  r.categoryMappingsOutputDataProvider = new MappingsOutputDataProvider(
    db.collection('category-outputs')
  );

  r.rangeMappingsOutputDataProvider = new MappingsOutputDataProvider(
    db.collection('range-outputs')
  );

  r.labelMappingsOutputDataProvider = new MappingsOutputDataProvider(
    db.collection('label-outputs')
  );

  r.triggersDataProvider = new TriggersDataProvider(
    db.collection('ifttt-triggers')
  );

  return r;
};
