const JsonValidator = require('jsonschema').Validator;
const Boom = require('boom');

const CblocksController = require('../rest/controller/cblockController.js');
const MappingsController = require('../rest/controller/mappingsController.js');

const CblocksRoutes = require('../rest/routes/cblocksRoutes.js');
const CategoryMappingsRoutes = require(
  '../rest/routes/categoryMappingsRoutes.js');
const RangeMappingsRoutes = require('../rest/routes/rangeMappingsRoutes.js');

const Validator = require('../rest/controller/validator.js');

const putCategoryMappingSchema = require(
  '../rest/schema/putCategoryMappingSchema.js');
const putCategoryMappingValidator = new Validator(
  JsonValidator, putCategoryMappingSchema);

const putRangeMappingSchema = require(
  '../rest/schema/putRangeMappingSchema.js');
const putRangeMappingValidator = new Validator(
  JsonValidator, putRangeMappingSchema);

module.exports = (
  hapiServer, useCases) => {
    let r = {};

    r.cblocksRoutes = new CblocksRoutes(
      hapiServer,
      new CblocksController(
        useCases.cBlockUseCase, Boom));

    r.categoryMappingsRoutes = new CategoryMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.categoryMappingsUseCase, Boom, putCategoryMappingValidator));

    r.rangeMappingsRoutes = new RangeMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.rangeMappingsUseCase, Boom, putRangeMappingValidator));

    return r;
};
