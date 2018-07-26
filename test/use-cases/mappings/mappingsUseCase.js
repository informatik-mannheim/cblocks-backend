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
});

async function getCategoryMappingShouldResoveIfDataProviderDoes() {
  givenMappingsDataProviderResolvesWithTemperatureMapping();

  await whenGetTemperatureCategoryMapping();

  shouldResolveWithTemperatureMapping();
}

function givenMappingsDataProviderResolvesWithTemperatureMapping() {
  mappingsDataProvider.getCategorMapping = sinon.stub().resolves(
    stubs.temperatureCategoryMapping);
}

async function whenGetTemperatureCategoryMapping() {
  mapping = await mappingsDataProvider.getCategorMapping(4711);
}

function shouldResolveWithTemperatureMapping() {
  expect(mapping.mappingID).to.equal(4711);
}
