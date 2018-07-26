const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const DataProvider = require('../../data-provider/mappingsDataProvider.js');
const Validator = require('jsonschema').Validator;
const stubs = require('../stubs/mappings');
let collection;
let promise;
let dataProvider;

describe('MappingsDataProvider', () => {
  beforeEach(() => {
    collection = {};
    dataProvider = {};
    promise = {};
  });

  describe('getCategoryMapping', () => {
    it('should resolve with category mapping if it exists',
      getCategoryMappingShouldResolveIfExists);

    it('should reject if mapping does not exist',
      getCategoryMappingShouldRejectIfNotExists);
  });

  describe('getCategoryMappings', () => {
    it('should resolve with category mappings if they exists',
      getCategoryMappingsShouldResolveIfTheyExist);

    it('should reject if no category mappings exist',
      getCateoryMappingsShouldRejectIfThereAreNone);
  });
});

async function getCategoryMappingShouldResolveIfExists() {
  givenMappings();
  givenDataProvider();

  await whenGetTemperatureCategoryMapping();

  shouldResolveWithTemperatureCategoryMapping();
}

function givenMappings() {
  collection.findOne = sinon.stub().resolves(stubs.temperatureCategoryMapping);
  collection.find = () => {
    return {
      'toArray': sinon.stub().resolves([stubs.temperatureCategoryMapping]),
    };
  };
}

function givenDataProvider() {
  dataProvider = new DataProvider(collection);
}

async function whenGetTemperatureCategoryMapping() {
  mapping = await dataProvider.getCategoryMapping(4711);
}

function shouldResolveWithTemperatureCategoryMapping() {
  expect(mapping.mappingID).to.equal(4711);
}

async function getCategoryMappingShouldRejectIfNotExists() {
  givenNoMappings();
  givenDataProvider();

  await whenGetTemperatureCategoryMappingShouldReject();
}

function givenNoMappings() {
  collection.findOne = sinon.stub().resolves(null);
  collection.find = () => {
    return {
      'toArray': sinon.stub().resolves([]),
    };
  };
}

async function whenGetTemperatureCategoryMappingShouldReject() {
  try {
    await whenGetTemperatureCategoryMapping();
    expect('Should throw an exception.').to.be.false;
  } catch (e) {
    expect(e.message).to.equal('Mapping could not be found.');
  }
}

async function getCategoryMappingsShouldResolveIfTheyExist() {
  givenMappings();
  givenDataProvider();

  whenGetCategoryMappings();

  shouldResolveWithCategoryMappings();
}

async function whenGetCategoryMappings() {
  promise = dataProvider.getCategoryMappings();
  mappings = await promise;
}

function shouldResolveWithCategoryMappings() {
  expect(mappings.length).to.equal(1);
}

async function getCateoryMappingsShouldRejectIfThereAreNone() {
  givenNoMappings();
  givenDataProvider();

  whenGetCategoryMappingsShouldReject();
}

async function whenGetCategoryMappingsShouldReject() {
  try {
    await whenGetCategoryMappings();
    expect('Should throw an exception.').to.be.false;
  } catch (e) {
    expect(e.message).to.equal('No Mappings found.');
  }
}
