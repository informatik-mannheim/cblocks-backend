const chai = require('chai');
const expect = chai.expect;

const mapping = require('../../../../core/entity/valueToLabelMapping.js');
const stubs = require('../../../stubs/labelMappings');

let value;
let map;

describe('Value To Label Mappping', () => {
  describe('apply', () => {
    it('should return default label if value does not match', () => {
      givenButtonLabelMapping();

      whenApplyWith(25);

      shouldReturn('Initial');
    });

    describe('atomic resources', () => {
      it('should return matching label', () => {
        givenButtonLabelMapping();

        whenApplyWith(true);

        shouldReturn('On');
      });
    });

    describe('compound resources', () => {
      it('should return matching label', () => {
        const offValue = {
          'red': 0,
          'green': 0,
          'blue': 0,
        };

        givenLedLabelMapping();

        whenApplyWith(offValue);

        shouldReturn('Off');
      });
    });
  });

  describe('isApplicableFor', () => {
    it('should return true', () => {
      givenButtonLabelMapping();

      whenIsApplicableFor();

      shouldReturn(true);
    });
  });
});

function givenButtonLabelMapping() {
  map = mapping.make(stubs.buttonLabelMapping);
}

function whenApplyWith(val) {
  value = map.apply(val);
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}

function whenIsApplicableFor() {
  value = map.isApplicableFor({});
}

function givenLedLabelMapping() {
  map = mapping.make(stubs.ledLabelMapping);
}
