const chai = require('chai');
const expect = chai.expect;

const mapping = require('../../../../core/entity/categoryMapping.js');
const stubs = require('../../../stubs/categoryMappings');

let map;
let value;

describe('Category Mappping', () => {
  describe('apply', () => {
    it('should return Low for 15', () => {
      givenMap();

      whenApply(15);

      shouldReturn('Low');
    });

    it('should return Medium for 25', () => {
      givenMap();

      whenApply(25);

      shouldReturn('Medium');
    });

    it('should return default label if out of range', () => {
      givenMap();

      whenApply(99);

      shouldReturn(getDefaultLabel());
    });
  });

  describe('isApplicableFor', () => {
    it('should return true if resource is numeric',
      isApplicableShouldReturnTrueForNumericResource);

    it('should return false if resource is not numeric',
      isApplicableShouldReturnFalseIfResourceIsNotNumeric);
  });
});

function givenMap() {
  map = mapping.make(stubs.temperatureCategoryMapping);
}

function whenApply(val) {
  value = map.apply(val);
}

function isApplicableShouldReturnTrueForNumericResource() {
  givenMap();

  whenIsApplicableForNumericResource();

  shouldReturn(true);
}

function whenIsApplicableForNumericResource() {
  const resource = {
    'isNumeric': () => true,
  };

  value = map.isApplicableFor(resource);
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}

function isApplicableShouldReturnFalseIfResourceIsNotNumeric() {
  givenMap();

  whenIsApplicableForNonNumericResource();

  shouldReturn(false);
}

function whenIsApplicableForNonNumericResource() {
  const resource = {
    'isNumeric': () => false,
  };

  value = map.isApplicableFor(resource);
}

function getDefaultLabel() {
  return stubs.temperatureCategoryMapping.default;
}
