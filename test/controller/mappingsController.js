const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');
const stubs = require('../stubs/mappings');

const MappingsController = require('../../controller/mappingsController.js');
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
    });

    it('should throw not found if use case throws exception',
      shouldThrowNotFoundIfUseCaseThrowsException);
});

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

function givenMappingsController() {
  hapiServer.route = sinon.spy();
  responseToolkit.response = sinon.spy();

  errorRenderer.notFound = Error;
  errorRenderer.boomify = sinon.spy();

  mappingsController = new MappingsController(
    hapiServer, mappingsUseCase, errorRenderer);
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
