const chai = require('chai');
const expect = chai.expect;

const cblock = require('../../../../core/entity/cblock.js');
const stubs = require('../../../stubs/cblocks');

let object;
let value;

describe('cBlock', () => {
  describe('make', () => {
    it('make should create a object with a resource property of type Resource', () => {
      givenCblock(stubs.temperature);

      resourcesShouldHaveMethods();
    });
  });

  describe('getResource', () => {
    it('should return resource if exists', () => {
      givenCblock(stubs.temperature);
      whenGetResource(0);

      shouldBeResource();
    });

    it('should throw exception if does not exist', () => {
      givenCblock(stubs.temperature);

      shouldThrow(whenGetResource.bind(null, 5));
    });
  });

  describe('getInstance', () => {
    it('should return instance if it exists', () => {
      givenCblock(stubs.temperature);

      whenGetInstance(0);

      shouldBeInstance();
    });
  });
});

function givenCblock(block) {
  object = cblock.make(block);
}

function resourcesShouldHaveMethods() {
  expect(object.resources[0].isNumeric()).to.be.true;
}

function whenGetResource(id) {
  value = object.getResource(0);
}

function shouldBeResource() {
  expect(value.isNumeric()).to.be.true;
}

function shouldThrow(fn) {
  expect(fn).to.throw;
}

function whenGetInstance(id) {
  value = object.getInstance(id);
}

function shouldBeInstance() {
  expect(typeof value.label !== 'undefined').to.be.true;
}
