const chai = require('chai');
const expect = chai.expect;

const rangeMap = require('../../../../core/entity/rangeMapping.js');
const stubs = require('../../../stubs/rangeMappings');

let map;
let value;

describe('Range Mappping', () => {
  describe('Output', () => {
    describe('apply', () => {
      it('should return 0 if value less min', () => {
        givenOutputMap();

        whenApply(19);

        shouldReturn(0);
      });

      it('should return 100 if value higher than max', () => {
        givenOutputMap();

        whenApply(31);

        shouldReturn(100);
      });

      it('should be 50% in the middle', () => {
        givenOutputMap();

        whenApply(25);

        shouldReturn(50);
      });
    });
  });

  describe('Input', () => {
    describe('apply', () => {
      it('should return 20 if value is 0', () => {
        givenInputMap();

        whenApply(0);

        shouldReturn(20);
      });

      it('should return 30 if value is 100', () => {
        givenInputMap();

        whenApply(100);

        shouldReturn(30);
      });

      it('should be 50% in the middle', () => {
        givenInputMap();

        whenApply(50);

        shouldReturn(25);
      });
    });
  });

  describe('isApplicableFor', () => {
    it('should return true if resource is numeric',
      isApplicableShouldReturnTrueForNumericResource);

    it('should return false if resource is not numeric',
      isApplicableShouldReturnFalseIfResourceIsNotNumeric);
  });
});

function givenOutputMap() {
  map = rangeMap.makeOutput(stubs.temperatureRangeMapping);
}

function whenApply(val) {
  value = map.apply(val);
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}

function givenInputMap() {
  map = rangeMap.makeInput(stubs.temperatureRangeMapping);
}

function isApplicableShouldReturnTrueForNumericResource() {
  givenOutputMap();

  whenIsApplicableForNumericResource();

  shouldReturn(true);
}

function whenIsApplicableForNumericResource() {
  const resource = {
    'isNumeric': () => true,
  };

  value = map.isApplicableFor(resource);
}

function isApplicableShouldReturnFalseIfResourceIsNotNumeric() {
  givenOutputMap();

  whenIsApplicableForNonNumericResource();

  shouldReturn(false);
}

function whenIsApplicableForNonNumericResource() {
  const resource = {
    'isNumeric': () => false,
  };

  value = map.isApplicableFor(resource);
}
