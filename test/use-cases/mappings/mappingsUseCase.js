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
    agent = {};
  });

  describe('getMapping', () => {
    it('should resolve if dataprovider does',
      getCategoryMappingShouldResoveIfDataProviderDoes);
  });

  describe('putCategoryMapping', () => {
    it('should call putCategoryMapping of dataprovider',
      putCategoryMappingShouldDeferToUseCase);

    it('should notify category mapping agent',
      putCategoryMappingShouldNotifyAgent);

    it('should throw if object resource is not of type number',
      putCategoryMappingShouldThrowIfObjectResourceIsNotANumber);

    it('should throw instance not found if instance does not exist',
      putCategoryMappingShouldThrowInstanceNotFoundIfItDoesNotExist);
  });

  describe('applyMapping', () => {
    it('should return correct label for value in range',
      applyMappingShouldReturnCorrectLabelForValueInRange);

    it('should return default label if out of range',
      applyMappingShouldReturnDefaultLabelIfOutOfRange);

    it('should throw if mapping does not exist',
      applyMappingShouldThrowIfMappingDoesNotExist);
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
  agent.onUpdateMappings = sinon.spy();
  mappingsUseCase = new MappingsUseCase(mappingsDataProvider, registry, agent);
  mappingsUseCase.registerOnUpdateMappings(agent.onUpdateMappings);
}

async function whenGetTemperatureCategoryMapping() {
  mapping = await mappingsUseCase.getCategoryMapping(4711);
}

function shouldResolveWithTemperatureMapping() {
  expect(mapping.mappingID).to.equal(4711);
}

async function putCategoryMappingShouldDeferToUseCase() {
  givenInstancesExist();
  givenResourceIsANumber();
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  await whenPutCategoryMapping();

  shouldCallPutCategoryMappingOfDataProvider();
}

function givenInstancesExist() {
  registry.getInstance = sinon.stub().resolves(
    transducerStubs.temperature.instances);
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

async function putCategoryMappingShouldNotifyAgent() {
  givenInstancesExist();
  givenResourceIsANumber();
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  await whenPutCategoryMapping();

  shouldNotifyAgent();
}

function shouldNotifyAgent() {
  expect(agent.onUpdateMappings.called).to.be.true;
}

async function putCategoryMappingShouldThrowIfObjectResourceIsNotANumber() {
  givenInstancesExist();
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

async function putCategoryMappingShouldThrowInstanceNotFoundIfItDoesNotExist() {
  givenInstancesDoesNotExist();
  givenResourceIsANumber();
  givenPutCategoryMappingResolves();
  givenMappingsUseCase();

  whenPutCategoryMapping();

  await shouldThrowInstanceDoesNotExistError();
}

function givenInstancesDoesNotExist() {
  registry.getInstance = sinon.stub().rejects(Error('Instance not found.'));
}

async function shouldThrowInstanceDoesNotExistError() {
  try {
    await promise;
    expect('this never').to.be.true;
  } catch (e) {
    expect(e.message).to.equal('Instance not found.');
  }
}

async function applyMappingShouldReturnCorrectLabelForValueInRange() {
  givenMappingExists();
  givenMappingsUseCase();

  await whenApplyTemperatureCategoryMappingInRange();

  shouldReturnCorrectLabel();
}

function givenMappingExists() {
  mappingsDataProvider.getCategoryMapping = sinon.stub().resolves(
    mappingStubs.temperatureCategoryMapping);
}

async function whenApplyTemperatureCategoryMappingInRange() {
  mappingLabel = await mappingsUseCase.applyMapping(4711, 25);
}

function shouldReturnCorrectLabel() {
  expect(mappingLabel).to.equal('Medium');
}

async function applyMappingShouldReturnDefaultLabelIfOutOfRange() {
  givenMappingExists();
  givenMappingsUseCase();

  await whenApplyTemperatureCategoryMappingOutOfRange();

  shouldReturnDefaultLabel();
}

async function whenApplyTemperatureCategoryMappingOutOfRange() {
  mappingLabel = await mappingsUseCase.applyMapping(4711, 90);
}

function shouldReturnDefaultLabel() {
  expect(mappingLabel).to.equal('High');
}

async function applyMappingShouldThrowIfMappingDoesNotExist() {
  givenMappingDoesNotExist();
  givenMappingsUseCase();

  await whenApplyCategoryMappingShouldThrow();
}

function givenMappingDoesNotExist() {
  mappingsDataProvider.getCategoryMapping = sinon.stub().rejects(
    Error('Mapping could not be found.')
  );
}

async function whenApplyCategoryMappingShouldThrow() {
  try {
    await whenApplyTemperatureCategoryMappingInRange();
    expect('this never').to.be.true;
  } catch (e) {
    expect(e.message).to.equal('Mapping could not be found.');
  }
}
