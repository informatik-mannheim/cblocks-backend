const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const CBlockUseCase = require('../../../use-cases/registry/cblockUseCase.js');
let registry;
let cBlockUseCase;
let promise;
const stubs = require('../../stubs');

describe('cBlockUseCase', () => {
  beforeEach(() => {
    registry = {};
  });

  describe('getCBlock', () => {
    it('should call registry', () => {
      givenRegistryReturnsTemperature();
      givenCBlockUseCase();

      whenGetCBlock();

      shouldCallGetCBlockOfRegistry();
    });

    it('should throw exception if registry does', () => {
      givenRegistryThrowsError();
      givenCBlockUseCase();

      whenGetCBlock();

      shouldReject();
    });
  });

  describe('getCBlocks', () => {
    it('should call registry', () => {
      givenRegistryReturnsAll();
      givenCBlockUseCase();

      whenGetCBlocks();

      shouldCallGetCBlocksOfRegistry();
    });
  });
});

function givenRegistryReturnsTemperature() {
  registry.getObject = sinon.stub().resolves(stubs.temperature);
}

function givenCBlockUseCase() {
  cBlockUseCase = new CBlockUseCase(registry);
}

function whenGetCBlock() {
  promise = cBlockUseCase.getCBlock(3303);
}

function shouldCallGetCBlockOfRegistry() {
  expect(registry.getObject.calledWith(3303)).to.be.true;
}

function givenRegistryThrowsError() {
  registry.getObject = sinon.stub().rejects(new Error('Error.'));
}

function shouldReject() {
  expect(promise).to.be.rejectedWith('Error.');
}

function givenRegistryReturnsAll() {
  registry.getObjects = sinon.stub().resolves(stubs.all);
}

function whenGetCBlocks() {
  promise = cBlockUseCase.getCBlocks();
}

function shouldCallGetCBlocksOfRegistry() {
  expect(registry.getObjects.called).to.be.true;
}
