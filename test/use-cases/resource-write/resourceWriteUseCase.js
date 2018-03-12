let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let ResourceWriteUseCase = require('../../../use-cases/resource-write/resourceWriteUseCase');
let resourceWriteUseCase;
let registry = {};
let writer = {};
let promise = {};

describe('ResourceWriteUseCase', function(){
  describe('write', function(){
    it('should call writer', function(){
      givenValidationSuccess()
      givenWriteSuccess()
      givenResourceWriteUseCase()

      whenWrite()

      shouldCallWriter()
    })

    it('should reject if validate fails', function(){
      givenValidationFailure()
      givenResourceWriteUseCase()

      whenWrite()

      shouldReject()
    })

    it('should reject if write fails', function(){
      givenValidationSuccess()
      givenWriteFailure()
      givenResourceWriteUseCase()

      whenWrite()

      shouldReject()
    })

    it('should resolve if write succeeds', function(){
      givenValidationSuccess()
      givenWriteSuccess()
      givenResourceWriteUseCase()

      whenWrite()

      shouldResolve()
    })
  })

  function givenValidationFailure(){
    registry.validateWrite = sinon.stub()
    registry.validateWrite.rejects("Validation error.")
  }

  function givenResourceWriteUseCase(){
    resourceWriteUseCase = new ResourceWriteUseCase(registry, writer)
  }

  function whenWrite(){
    promise = resourceWriteUseCase.write('mqttFX', 3304, 0, 0, true)
  }

  function shouldReject(){
    expect(promise).to.be.rejected;
  }

  function givenValidationSuccess(){
    registry.validateWrite = sinon.stub()
    registry.validateWrite.resolves()
  }

  function givenWriteFailure(){
    writer.writeResourceValue = sinon.stub();
    writer.writeResourceValue.rejects('Timeout.');
  }

  function givenWriteSuccess(){
    writer.writeResourceValue = sinon.stub();
    writer.writeResourceValue.resolves();
  }

  function shouldResolve(){
    expect(promise).to.be.fulfilled;
  }

  function shouldCallWriter(){
    expect(writer.writeResourceValue.calledWith('mqttFX'), 3304, 0, 0, true)
  }
})
