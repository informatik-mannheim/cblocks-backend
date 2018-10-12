const chai = require('chai');
const expect = chai.expect;

const cblock = require('../../../../core/entity/cblock.js');
const stubs = require('../../../stubs/cblocks');

let value;

describe('cBlock', () => {
  describe('make', () => {
    it('make should create a object with a resource property of type Resource', () => {
      whenMake(stubs.temperature);

      resourcesShouldHaveMethods();
    });
  });
});

function whenMake(block) {
  value = cblock.make(block);
}

function resourcesShouldHaveMethods() {
  expect(value.resources[0].isNumeric()).to.be.true;
}
