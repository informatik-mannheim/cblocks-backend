const chai = require('chai');
const expect = chai.expect;

const validateHeaders = require('../../../../rest/routes/ifttt/validateHeaders.js');
const serviceKey = '4711';

let val;

describe('IFTT validate header', () => {
  beforeEach(async () => {
    val = null;
  });

  it('should do nothing if channel-key and service-key match service-key', () => {
    whenValidate({
      'ifttt-channel-key': serviceKey,
      'ifttt-service-key': serviceKey,
    }, serviceKey);

    // should do nothing
  });

  it('should throw error if channel-key does not match service-key', () => {
    shouldThrow('Channel key invalid.', whenValidate.bind(null, {
      'ifttt-channel-key': 'INVALID',
      'ifttt-service-key': 'INVALID',
    }, serviceKey));
  });

  it('should throw error if service-key does not match service-key', () => {
    shouldThrow('Service key invalid.', whenValidate.bind(null, {
      'ifttt-channel-key': serviceKey,
      'ifttt-service-key': 'INVALID',
    }, serviceKey));
  });
});

function whenValidate(headers, serviceKey) {
  val = validateHeaders(serviceKey, Error)(headers);
}

function shouldThrow(message, fn) {
  expect(fn).to.throw(message);
}
