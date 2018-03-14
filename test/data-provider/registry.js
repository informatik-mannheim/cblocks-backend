const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const sinon = require('sinon');

const Registry = require('../../data-provider/registry.js');
const db = {};
const Validator = require('jsonschema').Validator;
const stubs = require('../stubs');
let promise;
let registry;

describe('Registry', () => {
  function givenTemperatureObject() {
    db.findOne = sinon.stub();

    db.findOne.withArgs({'objectID': 3303}).resolves(stubs.temperature);
  }

  function givenTemperatureObjectWithNoResources() {
    const tempWithoutResources = Object.assign({}, stubs.temperature);
    delete tempWithoutResources.resources;

    db.findOne = sinon.stub();
    db.findOne.withArgs({'objectID': 3303}).resolves(tempWithoutResources);
  }

  function givenRegistry() {
    db.updateOne = sinon.stub().resolves();

    registry = new Registry(db, new Validator());
  }

  function shouldResolve() {
    expect(promise).to.be.fulfilled;
  }

  describe('getObject', () => {
    it('should resolve if object exists', function(done) {
      givenTemperatureObject();
      givenRegistry();

      whenGetTemperatureObject();

      shouldResolveWithTemperatureObject(done);
    });

    function whenGetTemperatureObject() {
      promise = registry.getObject(3303);
    }

    function shouldResolveWithTemperatureObject(done) {
      promise.then(function(object) {
        expect(object.objectID).to.equal(3303);
        done();
      }).catch(function(err) {
        done(err);
      });
    }

    it('should reject if object does not exist', () => {
      givenNoObjects();
      givenRegistry();

      whenGetTemperatureObject();

      shouldReject();
    });

    function givenNoObjects() {
      db.findOne = sinon.stub().resolves(null);
    }

    function shouldReject() {
      expect(promise).to.be.rejectedWith('cBlock does not exist.');
    }
  });

  describe('getObjects', () => {
    it('should resolve if there are objects', function() {
      givenTemperatureAndLEDObject();
      givenRegistry();

      whenGetObjects();

      shouldResolveWithAllObjects();
    });

    function givenTemperatureAndLEDObject() {
      db.find = () => {
        return {
          'toArray': sinon.stub().resolves(stubs.all),
        };
      };
    }

    function whenGetObjects() {
      promise = registry.getObjects();
    }

    function shouldResolveWithAllObjects() {
      expect(promise).to.become(stubs.all);
    }
  });

  describe('getResource', () => {
    it('should resolve if resource exists', function(done) {
      givenTemperatureObject();
      givenRegistry();

      whenGetResource();

      shouldResolveWithResource(done);
    });

    function whenGetResource() {
      promise = registry.getResource(3303, 0);
    }

    function shouldResolveWithResource(done) {
      promise.then(function(resource) {
        expect(resource.resourceID).to.equal(0);
        done();
      }).catch(function(err) {
        done(err);
      });
    }

    it('should reject if resource does not exist', () => {
      givenTemperatureObjectWithNoResources();
      givenRegistry();

      whenGetResource();

      shouldRejectWithResourceNotFound();
    });

    function shouldRejectWithResourceNotFound() {
      expect(promise)
        .to.eventually.be.rejectedWith('Resource can\'t be found.');
    }
  });

  describe('validate', () => {
    it('should resolve if data is valid and resource exists', () => {
      givenTemperatureObject();
      givenRegistry();

      whenValidateTemperatureWithNumber();

      shouldResolve();
    });

    function whenValidateTemperatureWithNumber() {
      promise = registry.validate(3303, 0, 33.2);
    }

    it('should reject if data is invalid', () => {
      givenTemperatureObject();
      givenRegistry();

      whenValidateTemperatureWithBool();

      shouldRejectWithValidationError();
    });

    function whenValidateTemperatureWithBool() {
      promise = registry.validate(3303, 0, true);
    }

    function shouldRejectWithValidationError() {
      expect(promise).to.be.rejectedWith('instance is not of a type(s) number');
    }
  });

  describe('validateWrite', () => {
    it('should reject if resource is not writable', () => {
      givenTemperatureObject();
      givenRegistry();

      whenValidateWriteTemperatureWithNumber();

      shouldRejectWithResourceIsNotWritable();
    });

    function whenValidateWriteTemperatureWithNumber() {
      promise = registry.validateWrite(3303, 0, 33.2);
    }

    function shouldRejectWithResourceIsNotWritable() {
      expect(promise).to.be.rejectedWith('Resource is not writable.');
    }

    it('should resolve if resource is writable and correct format', () => {
      givenLEDObject();
      givenRegistry();

      whenValidateWriteLedOn();

      shouldResolve();
    });

    function givenLEDObject() {
      db.findOne = sinon.stub();

      db.findOne.withArgs({'objectID': 3304}).resolves(stubs.led);
    }

    function whenValidateWriteLedOn() {
      promise = registry.validateWrite(3304, 0, true);
    }
  });

  describe('setInstanceLabel', () => {
    it('should resolve if instance exists', () => {
      givenTemperatureObject();
      givenRegistry();

      whenSetInstanceLabel();

      shouldResolve();
    });

    function whenSetInstanceLabel() {
      promise = registry.setInstanceLabel(3303, 0, 'Chair.');
    }

    it('should reject if instance does not exists', () => {
      givenTemperatureObject();
      givenRegistry();

      whenSetLabelOfNotExistingInstance();

      shouldRejectWithInstanceNotFound();
    });

    function whenSetLabelOfNotExistingInstance() {
      promise = registry.setInstanceLabel(3303, 1, 'Chair.');
    }
  });

  function shouldRejectWithInstanceNotFound() {
    expect(promise).to.be.rejectedWith('Instance not found.');
  }

  describe('getInstance', () => {
    it('should resolve with instance if found', () => {
      givenTemperatureObject();
      givenRegistry();

      whenGetTemperatureInstance();

      shouldResolveWithInstance();
    });

    function whenGetTemperatureInstance() {
      promise = registry.getInstance(3303, 0);
    }

    function shouldResolveWithInstance() {
      expect(promise).to.become(stubs.temperature.instances[0]);
    }

    it('should reject if there there is no instance', () => {
      givenTemperatureObject();
      givenRegistry();

      whenGetNonExistingTemperatureInstance();

      shouldRejectWithInstanceNotFound();
    });

    function whenGetNonExistingTemperatureInstance() {
      promise = registry.getInstance(3303, 1);
    }
  });
});
