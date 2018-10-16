const JsonValidator = require('jsonschema').Validator;
const Boom = require('boom');

const CblocksController = require('../rest/controller/cblockController.js');
const MappingsController = require('../rest/controller/mappingsController.js');

const CblocksRoutes = require('../rest/routes/cblocksRoutes.js');
const CategoryMappingsRoutes = require(
  '../rest/routes/categoryMappingsRoutes.js');
const RangeMappingsRoutes = require('../rest/routes/rangeMappingsRoutes.js');
const LabelMappingsRoutes = require('../rest/routes/labelMappingsRoutes.js');

const IftttTestRoutes = require('../rest/routes/ifttt/testRoutes.js');
const IftttTestController = require('../rest/controller/ifttt/testController.js');

const Validator = require('../rest/controller/validator.js');

const putCategoryMappingSchema = require(
  '../rest/schema/putCategoryMappingSchema.js');
const putCategoryMappingValidator = new Validator(
  JsonValidator, putCategoryMappingSchema);

const putRangeMappingSchema = require(
  '../rest/schema/putRangeMappingSchema.js');
const putRangeMappingValidator = new Validator(
  JsonValidator, putRangeMappingSchema);

const putLabelMappingSchema = require(
  '../rest/schema/putLabelMappingSchema.js');
const putLabelMappingValidator = new Validator(
  JsonValidator, putLabelMappingSchema);

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

    r.labelMappingsRoutes = new LabelMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.labelMappingsUseCase, Boom, putLabelMappingValidator));

    r.ifttt = {
      'testRoutes': new IftttTestRoutes(
          hapiServer,
          new IftttTestController()
      ),
    };

    return r;
};
