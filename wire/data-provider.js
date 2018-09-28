const JsonValidator = require('jsonschema').Validator;

const Registry = require('../data-provider/registry.js');
const MappingsDataProvider = require(
  '../data-provider/mappingsDataProvider.js');

module.exports = (db) => {
  let r = {};

  r.registry = new Registry(db.collection('registry'), new JsonValidator());

  r.categoryMappingsDataProvider = new MappingsDataProvider(
    db.collection('category-mappings'));

  r.rangeMappingsDataProvider = new MappingsDataProvider(
    db.collection('range-mappings'));

  r.labelMappingsDataProvider = new MappingsDataProvider(
    db.collection('label-mappings')
  );

  return r;
};
