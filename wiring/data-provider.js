const JsonValidator = require('jsonschema').Validator;

const Registry = require('../data-provider/registry.js');
const MappingsDataProvider = require(
  '../data-provider/mappingsDataProvider.js');

module.exports = (db) => {
  return {
    'registry': new Registry(db.collection('registry'), new JsonValidator()),
    'categoryMappingsDataProvider': new MappingsDataProvider(
      db.collection('category-mappings')),
    'rangeMappingsDataProvider': new MappingsDataProvider(
      db.collection('range-mappings')),
  };
};
