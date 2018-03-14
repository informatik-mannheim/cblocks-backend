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
    responseToolkit = {};
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

  describe('Patch instance label', () => {
    it('should call setInstanceLabel of use case', async () => {
      givenSuccessfullSetLabel();
      givenCBlockController();

      await whenPatchWithLabel();

      shouldCallSetLabelOfUseCase();
      shouldReturnOkResponse();
    });

    it('should not call setInstanceLabel of use case if label not provided',
      async () => {
        givenSuccessfullSetLabel();
        givenCBlockController();

        await whenPatchWithoutLabel();

        shouldNotCallSetLabelOfUseCase();
        shouldReturnOkResponse();
      });

    it('should wrap errors with boomify', async () => {
      givenErrorSetLabel();
      givenCBlockController();

      await whenPatchLabelShouldThrowBoomError();
    });
  });
});

function givenUseCaseReturnsTemperatureCBlock() {
  cBlockUseCase.getCBlocks = sinon.stub().resolves(stubs.temperature);
  cBlockUseCase.getCBlock = sinon.stub().resolves(stubs.temperature);
}

function givenCBlockController() {
  hapiServer.route = sinon.spy();
  responseToolkit.response = sinon.spy();

  errorRenderer.notFound = Error;
  errorRenderer.boomify = sinon.spy();

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

function givenSuccessfullSetLabel() {
  cBlockUseCase.setInstanceLabel = sinon.stub().resolves();
}

async function whenPatchWithLabel() {
  let request = {
    'payload': {
      'label': 'Chair',
    },
    'params': {
      'objectID': '3303',
      'instanceID': '0',
    },
  };

  return await cBlockController._handlePatchInstance(request, responseToolkit);
}

function shouldCallSetLabelOfUseCase() {
  expect(cBlockUseCase
    .setInstanceLabel.calledWith(3303, 0, 'Chair')).to.be.true;
}

function shouldReturnOkResponse() {
  expect(responseToolkit.response.calledWith('Ok.')).to.be.true;
}

async function whenPatchWithoutLabel() {
  let request = {
    'payload': {
      'somethingDifferent': 'Chair',
    },
    'params': {
      'objectID': '3303',
      'instanceID': '0',
    },
  };

  return await cBlockController._handlePatchInstance(request, responseToolkit);
}

function shouldNotCallSetLabelOfUseCase() {
  expect(cBlockUseCase.setInstanceLabel.called).to.be.false;
}

function givenErrorSetLabel() {
  cBlockUseCase.setInstanceLabel =
    sinon.stub().rejects(new Error('Something went wrong.'));
}

async function whenPatchLabelShouldThrowBoomError() {
  try {
    await whenPatchWithLabel();
    expect(true).to.be.false;
  } catch (e) {
    expect(errorRenderer.boomify.called).to.be.true;
  }
}
