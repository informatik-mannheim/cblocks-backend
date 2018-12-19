const chai = require('chai');
const expect = chai.expect;

const JsonSchema = require('jsonschema').Validator;
const Validator = require('../../../rest/controller/validator.js');
const schema = require('../../stubs/schema/dummy.js');

let validator;

describe('Validator', () => {
  beforeEach(()=>{
    validator = {};
  });
  describe('validate', () => {
    it('should do nothing if matches schema',
      validateShouldDoNothingIfMatchesSchema);

    it('should throw an exception if object does not match schema',
      validateShouldThrowExceptionIfOjbectDoesNotMatchSchema);
  });
});

function validateShouldDoNothingIfMatchesSchema() {
  givenDummyValidator();

  whenValidateCorrectObject();

  shouldDoNothing();
}

function givenDummyValidator() {
  validator = new Validator(JsonSchema, schema);
}

function whenValidateCorrectObject() {
  validator.validate({
    'test': 'test',
  });
}

function shouldDoNothing() {
  // nothing
}

function validateShouldThrowExceptionIfOjbectDoesNotMatchSchema() {
  givenDummyValidator();

  whenValidateFalseObjectShouldThrowException();
}

function whenValidateFalseObjectShouldThrowException() {
  expect(validator.validate.bind({}, {
    'test': 123,
  })).to.throw();
}
