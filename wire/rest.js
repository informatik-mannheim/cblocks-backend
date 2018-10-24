const JsonValidator = require('jsonschema').Validator;
const Boom = require('boom');
const renderError = Boom.boomify;

const CblocksController = require('../rest/controller/cblockController.js');
const MappingsController = require('../rest/controller/mappingsController.js');

const CblocksRoutes = require('../rest/routes/cblocksRoutes.js');
const CategoryMappingsRoutes = require(
  '../rest/routes/categoryMappingsRoutes.js');
const RangeMappingsRoutes = require('../rest/routes/rangeMappingsRoutes.js');
const LabelMappingsRoutes = require('../rest/routes/labelMappingsRoutes.js');

const IftttTestRoutes = require('../rest/routes/ifttt/testRoutes.js');
const IftttTestController = require('../rest/controller/ifttt/testController.js');
const IftttStatusRoutes = require('../rest/routes/ifttt/statusRoutes.js');
const IftttStatusController = require('../rest/controller/ifttt/statusController.js');
const IftttTriggersRoutes = require('../rest/routes/ifttt/triggersRoutes.js');
const IftttTriggersController = require('../rest/controller/ifttt/triggersController.js');
const iftttValidateHeaders = require('../rest/routes/ifttt/validateHeaders.js');
const iftttRenderError = require('../rest/util/iftttErrorRenderer.js')(Boom.boomify);

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
  hapiServer, useCases, iftttConfig) => {
    let r = {};

    r.cblocksRoutes = new CblocksRoutes(
      hapiServer,
      new CblocksController(
        useCases.cBlockUseCase, renderError));

    r.categoryMappingsRoutes = new CategoryMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.categoryMappingsUseCase, renderError, putCategoryMappingValidator));

    r.rangeMappingsRoutes = new RangeMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.rangeMappingsUseCase, renderError, putRangeMappingValidator));

    r.labelMappingsRoutes = new LabelMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.labelMappingsUseCase, renderError, putLabelMappingValidator));

    r.ifttt = {
      'testRoutes': new IftttTestRoutes(
        hapiServer,
        new IftttTestController(useCases.recordResourceOutputUseCase),
        iftttValidateHeaders(iftttConfig['service-key'], iftttRenderError)
      ),
      'statusRoutes': new IftttStatusRoutes(
        hapiServer,
        new IftttStatusController(),
        iftttValidateHeaders(iftttConfig['service-key'], iftttRenderError),
      ),
      'triggersRoutes': new IftttTriggersRoutes(
        hapiServer,
        new IftttTriggersController(useCases.triggersUseCase, iftttRenderError),
        iftttValidateHeaders(iftttConfig['service-key'], iftttRenderError)
      ),
    };

    return r;
};
