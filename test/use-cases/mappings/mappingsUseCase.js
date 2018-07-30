const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const MappingsUseCase = require('../../../use-cases/mappings/mappingsUseCase.js');
let mappingsDataProvider;
let registry;
let mappingsUseCase;
let promise;
const transducerStubs = require('../../stubs');
const mappingStubs = require('../../stubs/mappings');

describe('mappingsUseCase', () => {
  beforeEach(() => {
    mappingsDataProvider = {};
    registry = {};
    mappingsUseCase = {};
    promise = {};
  });

  describe('getMapping', () => {
    it('should resolve if dataprovider does',
      getCategoryMappingShouldResoveIfDataProviderDoes);
  });

  describe('putCategoryMapping', () => {
    it('should call putCategoryMapping of dataprovider',
      putCategoryMappingShouldDeferToUseCase);

    it('should throw if object resource is not of type number',
      putCategoryMappingShouldThrowIfObjectResourceIsNotANumber);
  });
});

async function getCategoryMappingShouldResoveIfDataProviderDoes() {
  givenMappingsDataProviderResolvesWithTemperatureMapping();
  givenMappingsUseCase();

  await whenGetTemperatureCategoryMapping();

  shouldResolveWithTemperatureMapping();
}

function givenMappingsDataProviderResolvesWithTemperatureMapping() {
  mappingsDataProvider.getCategoryMapping = sinon.stub().resolves(
    mappingStubs.temperatureCategoryMapping);
}

function givenMappingsUseCase() {
  mappingsUseCase = new MappingsUseCase(mappingsDataProvider, registry);
}

async function whenGetTemperatureCategoryMapping() {
  mapping = await mappingsUseCase.getCategoryMapping(4711);
}

function shouldResolveWithTemperatureMapping() {
  expect(mapping.mappingID).to.equal(4711);
}

async function putCategoryMappingShouldDeferToUseCase() {
  givenResourceIsANumber();
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  await whenPutCategoryMapping();

  shouldCallPutCategoryMappingOfDataProvider();
}

function givenResourceIsANumber() {
  registry.getResource = sinon.stub().resolves(
    transducerStubs.temperature.resources[0]);
}

function givenPutCategoryMappingResolves() {
  mappingsDataProvider.putCategoryMapping = sinon.stub().resolves();
}

function whenPutCategoryMapping() {
  return promise = mappingsUseCase.putCategoryMapping(
    4711, mappingStubs.temperatureCategoryMapping);
}

function shouldCallPutCategoryMappingOfDataProvider() {
  expect(mappingsDataProvider.putCategoryMapping.calledWith(
    4711, mappingStubs.temperatureCategoryMapping
  ));
}

async function putCategoryMappingShouldThrowIfObjectResourceIsNotANumber() {
  givenResourceIsNotANumber();
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  whenPutCategoryMapping();

  await shouldThrowResourceIsNotANumberError();
}

function givenResourceIsNotANumber() {
  registry.getResource = sinon.stub().resolves(
    transducerStubs.led.resources[0]);
}

async function shouldThrowResourceIsNotANumberError() {
  try {
    await promise;
    expect('this never').to.be.true;
  } catch (e) {
    expect(e.message).to.equal('Resource 0 of Object 3303 is not a number');
  }
}
