const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');
const stubs = require('../stubs/mappings');

const MappingsController = require('../../controller/mappingsController.js');
const JsonSchema = require('jsonschema').Validator;
const Validator = require('../../core/validator');
const putCategoryMappingSchema = require(
  '../../controller/schema/putCategoryMappingSchema.js');
const putCategoryMappingValidator = new Validator(
  JsonSchema, putCategoryMappingSchema);

let mappingsUseCase = {};
let mappingsController = {};
let hapiServer = {};
let errorRenderer = {};
let responseToolkit = {};

describe('MappingsController', () => {
  beforeEach(() => {
    mappingsUseCase = {};
    hapiServer = {};
    errorRenderer = {};
    responseToolkit = {};

    givenMappingsController();
  });

  describe('GET mappings/category/{mappingID}', () => {
    it('should call getCategoryMapping of use case if mapping ID is provided',
      shouldCallGetMappingOfUseCaseIfMappingIDIsProvided);

    it('should call getCategoryMappings of use case if mapping ID is not \
      provided',
      shouldCallGetMappingsOfUseCaseIfMappingIDIsNotProvided);

    it('should throw not found if use case throws exception',
      shouldThrowNotFoundIfUseCaseThrowsException);
  });

  describe('PUT mappings/category', () => {
    it('should call use case and respond if successfull',
      putCategoryMappingsShouldCallUseCaseAndRespond);

    it('should respond with code 500 if use case fails',
      putCategoryMappingsShouldrespondWith500IfUseCaseFails);

    it('should respond with 400 if it has additional properties',
      putCategoryMappingShouldRespondWith400IfAdditionalProperties);

    it('should respond with 400 if label is missing',
      putCategoryMappingShouldRespondWith400IfLabelMissing);
  });

  describe('DELETE mappings/category', () => {
    it('should respond 200 with if successfull',
      deleteCategoryMappingShouldRespond200IfSuccessfull);

      it('should respond with code 500 if use case fails',
        deleteCategoryMappingShouldrespondWith500IfUseCaseFails);
  });
});

function givenMappingsController() {
  hapiServer.route = sinon.spy();
  responseToolkit.response = sinon.spy();

  errorRenderer.notFound = Error;
  errorRenderer.boomify = sinon.spy();

  mappingsController = new MappingsController(
    hapiServer, mappingsUseCase, errorRenderer, putCategoryMappingValidator);
};

async function shouldCallGetMappingOfUseCaseIfMappingIDIsProvided() {
  givenUseCaseReturnsTemperatureCategoryMapping();
  givenMappingsController();

  await whenGetCategoryMappingWithMappingID();

  shouldCallGetMappingOfUseCase();
  shouldResolveWithCategoryMapping();
};

function givenUseCaseReturnsTemperatureCategoryMapping() {
  mappingsUseCase.getCategoryMapping = sinon.stub();
  mappingsUseCase.getCategoryMapping.resolves(
    stubs.temperatureCategoryMapping);

  mappingsUseCase.getCategoryMappings = sinon.stub();
  mappingsUseCase.getCategoryMappings.resolves(
    [stubs.temperatureCategoryMapping]);
};

async function whenGetCategoryMappingWithMappingID() {
  let request = {
    'params': {
      'mappingID': 4711,
    },
  };

  mapping = await mappingsController._handleGetCategoryMappings(request);
};

function shouldCallGetMappingOfUseCase() {
  expect(mappingsUseCase.getCategoryMapping.calledWith(4711)).to.be.true;
};

function shouldResolveWithCategoryMapping() {
  expect(mapping.mappingID).to.equal(4711);
};

async function shouldCallGetMappingsOfUseCaseIfMappingIDIsNotProvided() {
  givenUseCaseReturnsTemperatureCategoryMapping();

  await whenGetCategoryMappings();

  shouldCallGetMappingsOfUseCase();
  shouldResolveWithCategoryMappings();
}

async function whenGetCategoryMappings() {
  const request = {
    'params': {},
  };

  mappings = await mappingsController._handleGetCategoryMappings(request);
}

function shouldCallGetMappingsOfUseCase() {
  expect(mappingsUseCase.getCategoryMappings.called).to.be.true;
}

function shouldResolveWithCategoryMappings() {
  expect(mappings.length).to.equal(1);
}

async function shouldThrowNotFoundIfUseCaseThrowsException() {
  givenUseCaseRejects();

  promise = whenGetCategoryMappingWithMappingID();

  shouldRejectWithNotFoundError();
}

function givenUseCaseRejects() {
  mappingsUseCase.getCategoryMapping = sinon.stub();
  mappingsUseCase.getCategoryMapping.rejects(Error('Not found.'));

  mappingsUseCase.getCategoryMappings = sinon.stub();
  mappingsUseCase.getCategoryMappings.rejects(Error('Not found.'));
}

function shouldRejectWithNotFoundError() {
  expect(promise).to.be.rejected;
}

async function putCategoryMappingsShouldCallUseCaseAndRespond() {
  givenPutCategoryMappingResolves();

  await whenPutCategoryMapping();

  shouldCallPutCategoryMappingOfUseCase();
  shouldRepondOk();
}

function givenPutCategoryMappingResolves() {
  mappingsUseCase.putCategoryMapping = sinon.stub().resolves();
}

async function whenPutCategoryMapping() {
  let stub = Object.assign({}, stubs.temperatureCategoryMapping);
  delete stub.mappingID;

  const request = {
    'payload': stub,
    'params': {
      'mappingID': '4711',
    },
  };

  await mappingsController._handlePutCategoryMapping(
    request, responseToolkit);
}

function shouldCallPutCategoryMappingOfUseCase() {
  let stub = Object.assign({}, stubs.temperatureCategoryMapping);
  delete stub.mappingID;

  expect(mappingsUseCase.putCategoryMapping.calledWith(4711, stub)).to.be.true;
}

function shouldRepondOk() {
  expect(responseToolkit.response.calledWith('Ok.')).to.be.true;
}

async function putCategoryMappingsShouldrespondWith500IfUseCaseFails() {
  givenPutCategoryMappingRejects();

  whenPutCategoryMappingShouldRespondWith500();
}

function givenPutCategoryMappingRejects() {
  mappingsUseCase.putCategoryMapping = sinon.stub().rejects(
    Error('Some error.'));
}

async function whenPutCategoryMappingShouldRespondWith500() {
  try {
    await whenPutCategoryMapping();
  } catch (e) {

  } finally {
    expect(errorRenderer.boomify.calledWith(
      sinon.match.any, {statusCode: 500})).to.be.true;
  }
}

async function putCategoryMappingShouldRespondWith400IfAdditionalProperties() {
  givenMappingsController();

  whenPutCategoryMappingWithAdditionalProperties();

  await shouldFailWith400();
}

function whenPutCategoryMappingWithAdditionalProperties() {
  const request = {
    'payload': stubs.temperatureCategoryMapping,
    'params': {
      'mappingID': '4711',
    },
  };

  promise = mappingsController._handlePutCategoryMapping(
    request, responseToolkit);
}

async function shouldFailWith400() {
  try {
    await promise;
  } catch (e) {
  } finally {
    expect(errorRenderer.boomify.calledWith(
      sinon.match.any, {statusCode: 400})).to.be.true;
  }
}

async function putCategoryMappingShouldRespondWith400IfLabelMissing() {
  givenMappingsController();

  whenPutCategoryMappingWithMissinglabel();

  await shouldFailWith400();
}

function whenPutCategoryMappingWithMissinglabel() {
  let stub = Object.assign({}, stubs.temperatureCategoryMapping);
  delete stub.mappingID;
  delete stub.label;

  const request = {
    'payload': stub,
    'params': {
      'mappingID': '4711',
    },
  };

  promise = mappingsController._handlePutCategoryMapping(
    request, responseToolkit);
}

async function deleteCategoryMappingShouldRespond200IfSuccessfull() {
  givenDeleteSucceeds();
  givenMappingsController();

  await whenDeleteCategoryMapping();

  shouldRepondOk();
}

function givenDeleteSucceeds() {
  mappingsUseCase.deleteCategoryMapping = sinon.stub().resolves();
}

function whenDeleteCategoryMapping() {
  const request = {
    'params': {
      'mappingID': '4711',
    },
  };

  return promise = mappingsController._handleDeleteCategoryMapping(
    request, responseToolkit);
}

async function deleteCategoryMappingShouldrespondWith500IfUseCaseFails() {
  givenDeleteFails();
  givenMappingsController();

  whenDeleteCategoryMapping();

  await shouldFailWith500();
}

function givenDeleteFails() {
  mappingsUseCase.deleteCategoryMapping = sinon.stub().rejects(
    Error('Some error.'));
}

async function shouldFailWith500() {
  try {
    await promise;
  } catch (e) {

  } finally {
    expect(errorRenderer.boomify.calledWith(
      sinon.match.any, {statusCode: 500})).to.be.true;
  }
}
