let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let ResourcePublisherUseCase = require('../../use-cases/resource-publisher/resourcePublisherUseCase');

describe('ResourcePublisherUseCase', function(){
  let resourcePublisherUseCase;
  let registry = {};
  let publisher = {};
  let promise = {};

  describe('publish', function(){
    it('should reject if registry can not find resource', function(){
        givenRegistryWithNotFound();
        givenResourcePublisherUseCase();

        whenPublishTemperature();

        shouldReject();
    })

    function givenRegistryWithNotFound(){
      registry.validate = sinon.stub();
      registry.validate.rejects(new Error());
    }

    function givenResourcePublisherUseCase(){
      resourcePublisherUseCase = new ResourcePublisherUseCase(registry, publisher);
    }

    function whenPublishTemperature(){
      promise = resourcePublisherUseCase.publish(3303, 0, 0, 33.2);
    }

    function shouldReject(){
      expect(promise).to.be.rejected;
    }

    it('should reject if temperature resource published with bool', function(){
      givenValidatorForTemperature();
      givenResourcePublisherUseCase();

      whenPublishTemperatureWithBool();

      shouldReject();
    })

    function givenValidatorForTemperature(){
      registry.validate = sinon.stub();
      registry.validate.withArgs(3303, 0, true).rejects(new Error());
      registry.validate.withArgs(3303, 0, 33.2).resolves();
    }

    function whenPublishTemperatureWithBool(){
      promise = resourcePublisherUseCase.publish(3303, 0, 0, true);
    }

    it('should publish if validation resolves', function(){
      givenValidatorForTemperature();
      givenSuccessfullPublish();
      givenResourcePublisherUseCase();

      whenPublishTemperatureWithNumber();

      shouldPublish();
    })

    function givenSuccessfullPublish() {
      publisher.publishResourceValue = sinon.stub().resolves('Ok.');
    }

    function whenPublishTemperatureWithNumber(){
      promise = resourcePublisherUseCase.publish(3303, 0, 0, 33.2);
    }

    function shouldPublish() {
      expect(promise).to.eventually.equal('Ok.');
    }

  })
})
