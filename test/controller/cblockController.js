const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const CBlockController = require('../../controller/cblockController.js');
const stubs = require('../stubs');

describe('CBlockController', () => {
  beforeEach(() => {
    cBlockUseCase = {};
    cBlockController = {};
    hapiServer = {};
    errorRenderer = {};
  });

  describe('GET /cblocks/{objectID}', () => {
    it('should call getCBlock of use case, if objectID is provided', () => {
      givenUseCaseReturnsTemperatureCBlock();
      givenCBlockController();

      whenGetCBlocksWithObjectID();

      shouldCallGetCblockOfUseCase();
    });

    it('should call getCBlocks of use case if objectID not provided', () => {
      givenUseCaseReturnsTemperatureCBlock();
      givenCBlockController();

      whenGetCBlocksWithoutObjectID();

      shouldCallGetCblocksOfUseCase();
    });

    it('should throw not found if use case throws error', () => {
      givenUseCaseRejects();
      givenCBlockController();

      whenGetCBlocksWithObjectID();

      shouldRejectWithNotFoundError();
    });
  });
});

function givenUseCaseReturnsTemperatureCBlock() {
  cBlockUseCase.getCBlocks = sinon.stub().resolves(stubs.temperature);
  cBlockUseCase.getCBlock = sinon.stub().resolves(stubs.temperature);
}

function givenCBlockController() {
  hapiServer.route = sinon.spy();
  errorRenderer.notFound = Error;

  cBlockController = new CBlockController(
    hapiServer, cBlockUseCase, errorRenderer);
}

function whenGetCBlocksWithObjectID() {
  let request = {
    'params': {
      'objectID': 3303,
    },
  };

  promise = cBlockController._handleGetCBlocks(request);
}

function shouldCallGetCblockOfUseCase() {
  expect(cBlockUseCase.getCBlock.calledWith(3303)).to.be.true;
}

function whenGetCBlocksWithoutObjectID() {
  let request = {
    'params': {},
  };

  cBlockController._handleGetCBlocks(request);
}

function shouldCallGetCblocksOfUseCase() {
  expect(cBlockUseCase.getCBlocks.called).to.be.true;
}

function givenUseCaseRejects() {
  cBlockUseCase.getCBlock = sinon.stub().rejects(new Error('Not found.'));
}

function shouldRejectWithNotFoundError() {
  expect(promise).to.be.rejectedWith('Not found.');
}
