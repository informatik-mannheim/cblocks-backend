let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let expect = chai.expect;
chai.use(chaiAsPromised);
let sinon = require('sinon');

let Registry = require('../../registry/registry.js');
let db = {};
let Validator = require('jsonschema').Validator;
let stubs = require('../stubs');
let promise;

describe('Registry', function(){
  function givenTemperatureObject() {
    db.findOne = sinon.stub();

    db.findOne.withArgs({'objectID': 3303}).resolves(stubs.temperature);
  }

  function givenTemperatureObjectWithNoResources(){
    let tempWithoutResources = Object.assign({}, stubs.temperature);
    delete tempWithoutResources['resources'];

    db.findOne = sinon.stub();
    db.findOne.withArgs({'objectID': 3303}).resolves(tempWithoutResources);
  }

  function givenRegistry(){
    registry = new Registry(db, new Validator());
  }

  describe('getObject', function(){
    it('should resolve if object exists', function(done){
      givenTemperatureObject();
      givenRegistry();

      whenGetTemperatureObject();

      shouldResolveWithTemperatureObject(done);
    })

    function whenGetTemperatureObject(){
      promise = registry.getObject(3303);
    }

    function shouldResolveWithTemperatureObject(done){
      promise.then(function(object){
        expect(object.objectID).to.equal(3303);
        done();
      }).catch(function(err){
        done(err);
      })
    }

    it('should reject if object does not exist', function(){
      givenNoObjects();
      givenRegistry();

      whenGetTemperatureObject();

      shouldReject();
    })

    function givenNoObjects(){
      db.find = sinon.stub().rejects(new Error('Not found.'))
      db.findOne = sinon.stub().rejects(new Error('Not found.'))
    }

    function shouldReject(){
      expect(promise).to.be.rejectedWith('Not found.');
    }
  })

  describe('getResource', function(){
    it('should resolve if resource exists', function(done){
      givenTemperatureObject();
      givenRegistry();

      whenGetResource();

      shouldResolveWithResource(done);
    })

    function whenGetResource() {
      promise = registry.getResource(3303, 0);
    }

    function shouldResolveWithResource(done){
      promise.then(function(resource){
        expect(resource.resourceID).to.equal(0);
        done();
      }).catch(function(err){
        done(err);
      })
    }

    it('should reject if resource does not exist', function(){
      givenTemperatureObjectWithNoResources();
      givenRegistry();

      whenGetResource();

      shouldRejectWithResourceNotFound();
    })

    function shouldRejectWithResourceNotFound(){
      expect(promise).to.eventually.be.rejectedWith("Resource can't be found.");
    }
  })

  describe('validate', function(){
    it('should resolve if data is valid and resource exists', function(){
      givenTemperatureObject();
      givenRegistry();

      whenValidateTemperatureWithNumber();

      shouldResolve();
    })

    function whenValidateTemperatureWithNumber(){
      promise = registry.validate(3303, 0, 33.2);
    }

    function shouldResolve() {
      expect(promise).to.be.fulfilled;
    }

    it('should reject if data is invalid', function(){
      givenTemperatureObject();
      givenRegistry();

      whenValidateTemperatureWithBool();

      shouldRejectWithValidationError();
    })

    function whenValidateTemperatureWithBool() {
      promise = registry.validate(3303, 0, true);
    }

    function shouldRejectWithValidationError() {
      expect(promise).to.be.rejectedWith("instance is not of a type(s) number");
    }
  })
})
