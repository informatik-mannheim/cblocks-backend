const chai = require('chai');
const expect = chai.expect;

const resource = require('../../../../core/entity/resource.js');
const stubs = require('../../../stubs/cblocks');

let res;
let isNumeric;

describe('Resource', () => {
  it('isNumeric should return true for temperature', () => {
    givenTemperatureResource();

    whenIsNumeric();

    shouldReturn(true);
  });

  it('isNumeric should return false for on/off', () => {
    givenOnOffResource();

    whenIsNumeric();

    shouldReturn(false);
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
