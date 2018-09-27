const chai = require('chai');
const expect = chai.expect;

const mapping = require('../../../../core/entity/labelToValueMapping.js');
const stubs = require('../../../stubs/labelMappings');

let value;
let map;

describe('Label to Value Mappping', () => {
  describe('apply', () => {
    it('should throw label not found if label does not exist', () => {
      givenButtonLabelMapping();

      whenApplyWithNonExistingShouldThrow();
    });

    it('should return matching value if label exists', () => {
      givenButtonLabelMapping();

      whenApplyWith('On');

      shouldReturn(true);
    });
  });
});

function givenButtonLabelMapping() {
  map = mapping.make(stubs.buttonLabelMapping);
}

function whenApplyWithNonExistingShouldThrow() {
  expect(() => map.apply('None Existing')).to.throw('Label not found.');
}

function whenApplyWith(val) {
  value = map.apply(val);
}

function shouldReturn(val) {
  expect(value).to.equal(val);
}
