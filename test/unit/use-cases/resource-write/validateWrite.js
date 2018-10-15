const chai = require('chai');
const expect = chai.expect;

const validateWrite = require('../../../../use-cases/resource-write/validateWrite.js');
const stubs = require('../../../stubs/cblocks');

describe('validateWrite', () => {
  it('should do nothing if data is valid', () => {
    whenValidate(stubs.led['resources'][0], true);

    // should do nothing
  });

  it('should throw error if data is not valid', () => {
    shouldThrow(
      whenValidate.bind(null, stubs.led['resources'][0], 25.5));
  });
});

function whenValidate(resource, data) {
  validateWrite(resource, data);
}

function shouldThrow(fn) {
  expect(fn).to.throw;
}
