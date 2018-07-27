const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const MappingsUseCase = require('../../../use-cases/mappings/mappingsUseCase.js');
let mappingsDataProvider;
let mappingsUseCase;
let promise;
const stubs = require('../../stubs/mappings');

describe('mappingsUseCase', () => {
  beforeEach(() => {
    mappingsDataProvider = {};
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
    stubs.temperatureCategoryMapping);
}

function givenMappingsUseCase() {
  mappingsUseCase = new MappingsUseCase(mappingsDataProvider);
}

async function whenGetTemperatureCategoryMapping() {
  mapping = await mappingsUseCase.getCategoryMapping(4711);
}

function shouldResolveWithTemperatureMapping() {
  expect(mapping.mappingID).to.equal(4711);
}

async function putCategoryMappingShouldDeferToUseCase() {
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  await whenPutCategoryMapping();

  shouldCallPutCategoryMappingOfDataProvider();
}

function givenPutCategoryMappingResolves() {
  mappingsDataProvider.putCategoryMapping = sinon.stub().resolves();
}

async function whenPutCategoryMapping() {
  await mappingsUseCase.putCategoryMapping(
    4711, stubs.temperatureCategoryMapping);
}

function shouldCallPutCategoryMappingOfDataProvider() {
  expect(mappingsDataProvider.putCategoryMapping.calledWith(
    4711, stubs.temperatureCategoryMapping
  ));
}
