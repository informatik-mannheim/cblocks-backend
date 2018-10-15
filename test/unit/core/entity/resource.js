const chai = require('chai');
const expect = chai.expect;

const resource = require('../../../../core/entity/resource.js');
const stubs = require('../../../stubs/cblocks');

let res;
let isNumeric;

describe('Resource', () => {
  describe('isNumeric', () => {
    it('should return true for temperature', () => {
      givenTemperatureResource();

      whenIsNumeric();

      shouldReturn(true);
    });

    it('should return false for on/off', () => {
      givenOnOffResource();

      whenIsNumeric();

      shouldReturn(false);
    });
  });

  describe('validateWrite', () => {
    it('should do nothing if data is valid', () => {
      givenOnOffResource();

      whenValidate(true);

      // should do nothing
    });

    it('should throw error if data is not valid', () => {
      givenOnOffResource();

      shouldThrow(
        whenValidate.bind(null, 25.5));
    });
  });
});

function givenTemperatureResource() {
  res = resource.make(stubs.temperature['resources'][0]);
}

function whenIsNumeric() {
  isNumeric = res.isNumeric();
}

function shouldReturn(val) {
  expect(isNumeric).to.equal(val);
}

function givenOnOffResource() {
  res = resource.make(stubs.led['resources'][0]);
}

function whenValidate(data) {
  res.validateWrite(data);
}

function shouldThrow(fn) {
  expect(fn).to.throw;
}
