const JsonValidator = require('jsonschema').Validator;
const Boom = require('boom');
const renderError = Boom.boomify;
const ObjectID = require('mongodb').ObjectID;
const makeUUID = () => new ObjectID().toHexString()

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

const makeIftttTriggersRoutes = require('../rest/routes/ifttt/triggers/triggersRoutes.js');
const makeIftttNewSensorDataRoutes = require('../rest/routes/ifttt/triggers/newSensorDataRoutes.js');
const makeIftttTriggerMappingsRoutes = require('../rest/routes/ifttt/triggers/mappingsRoutes.js');
const makeIftttTriggersController = require('../rest/controller/ifttt/triggers/triggersController.js');
const makeIftttNewSensorDataController = require('../rest/controller/ifttt/triggers/newSensorDataController.js');
const makeIftttTriggerMappingsController = require('../rest/controller/ifttt/triggers/mappingsController.js');
const makeIftttValidateHeaders = require('../rest/routes/ifttt/validateHeaders.js');

const makeIftttActionMappingsRoutes = require('../rest/routes/ifttt/actions/mappingsRoutes.js');
const makeIftttActionMappingsController = require('../rest/controller/ifttt/actions/mappingsController.js');

const iftttRenderError = require('../rest/util/iftttErrorRenderer.js')(Boom.boomify);
const IftttRealTimeApi = require('../rest/controller/ifttt/realTimeApi.js');
const iftttRequest = require('../rest/controller/ifttt/requestIfttt.js');

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

exports.inbound = (
  hapiServer, useCases, iftttConfig) => {
    let r = {};

    const iftttTriggersController = makeIftttTriggersController(
      useCases.triggers.triggerIdentities
    );

    const iftttValidateHeaders = makeIftttValidateHeaders(
      iftttConfig['service-key'], iftttRenderError);

    r.cblocksRoutes = new CblocksRoutes(
      hapiServer,
      new CblocksController(
        useCases.cBlockUseCase, renderError));

    r.categoryMappingsRoutes = new CategoryMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.mappings.category.manage, renderError, putCategoryMappingValidator));

    r.rangeMappingsRoutes = new RangeMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.mappings.range.manage, renderError, putRangeMappingValidator));

    r.labelMappingsRoutes = new LabelMappingsRoutes(
      hapiServer,
      new MappingsController(
        useCases.mappings.label.manage, renderError, putLabelMappingValidator));

    r.ifttt = {
      'testRoutes': new IftttTestRoutes(
        hapiServer,
        new IftttTestController(
          useCases.recordResourceOutputUseCase,
          useCases.mappings.category.output,
          useCases.mappings.label.input,
          useCases.mappings.label.output
        ),
        iftttValidateHeaders
      ),
      'statusRoutes': new IftttStatusRoutes(
        hapiServer,
        new IftttStatusController(),
        iftttValidateHeaders
      ),
      'triggers': {
        'triggersRoutes': makeIftttTriggersRoutes(
          hapiServer,
          iftttTriggersController,
          iftttValidateHeaders
        ),
        'newSensorDataRoutes': makeIftttNewSensorDataRoutes(
          hapiServer,
          makeIftttNewSensorDataController(
            useCases.triggers.newSensorDataUseCase,
            iftttRenderError,
            iftttTriggersController,
          ),
          iftttValidateHeaders
        ),
        'categoryMappingsRoutes': makeIftttTriggerMappingsRoutes(
          hapiServer,
          makeIftttTriggerMappingsController(
            useCases.triggers.categoryMappingsUseCase,
            iftttRenderError,
            'category',
            iftttTriggersController,
          ),
          iftttValidateHeaders,
          'category'
        ),
        'labelMappingsRoutes': makeIftttTriggerMappingsRoutes(
          hapiServer,
          makeIftttTriggerMappingsController(
            useCases.triggers.labelMappingsUseCase,
            iftttRenderError,
            'label',
            iftttTriggersController,
          ),
          iftttValidateHeaders,
          'label'
        ),
      },
      'actions': {
        'labelMappingRoutes': makeIftttActionMappingsRoutes(
          hapiServer,
          makeIftttActionMappingsController(
            useCases.mappings.label.input,
            iftttRenderError,
            makeUUID,
          ),
          iftttValidateHeaders,
          'label'
        ),
      }
    };

    return r;
};

exports.outbound = (request, iftttConfig) => {
  let iftttRealtimeApi;

  if(!iftttConfig.enabled){
    iftttRealtimeApi = {
      'notify': () => {}
    };
  }else {
    iftttRealtimeApi = new IftttRealTimeApi(
      iftttRequest(
        iftttConfig['service-key'],
        makeUUID,
        request)
    );
  }

  return {
    'ifttt': {
      'realTimeApi': iftttRealtimeApi,
    },
  };
};
