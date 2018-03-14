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
      givenGetObjectResolves();
      givenCBlockUseCase();

      whenGetCBlock();

      shouldCallGetCBlockOfRegistry();
    });

    it('should throw exception if registry does', () => {
      givenGetObjectsRejects();
      givenCBlockUseCase();

      whenGetCBlock();

      shouldReject();
    });
  });

  function givenGetObjectResolves() {
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

  function givenGetObjectsRejects() {
    registry.getObject = sinon.stub().rejects(new Error('Error.'));
  }

  function shouldReject() {
    expect(promise).to.be.rejectedWith('Error.');
  }

  describe('getCBlocks', () => {
    it('should call registry', () => {
      givenGetObjectsResolves();
      givenCBlockUseCase();

      whenGetCBlocks();

      shouldCallGetCBlocksOfRegistry();
    });
  });

  function givenGetObjectsResolves() {
    registry.getObjects = sinon.stub().resolves(stubs.all);
  }

  function whenGetCBlocks() {
    promise = cBlockUseCase.getCBlocks();
  }

  function shouldCallGetCBlocksOfRegistry() {
    expect(registry.getObjects.called).to.be.true;
  }

  describe('setInstanceLabel', () => {
    it('should call registry', () => {
      givenSetInstanceLabelResolves();
      givenCBlockUseCase();

      whenSetInstanceLabel();

      shouldCallSetInstanceLabelOfRegistry();
      shouldResolve();
    });
  });

  function givenSetInstanceLabelResolves() {
    registry.setInstanceLabel = sinon.stub().resolves();
  }

  function whenSetInstanceLabel() {
    promise = cBlockUseCase.setInstanceLabel(3303, 0, 'Chair');
  }

  function shouldCallSetInstanceLabelOfRegistry() {
    expect(registry.setInstanceLabel.calledWith(3303, 0, 'Chair')).to.be.true;
  }

  function shouldResolve() {
    expect(promise).to.be.fulfilled;
  }
});
