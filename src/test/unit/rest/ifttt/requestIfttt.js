const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const serviceKey = '4711';
const makeUUID = () => 'ab575yxc';
const request = {
  'post': async (options) => ({}),
};

const makeRequestIfttt = require('../../../../rest/controller/ifttt/requestIfttt.js');
const requestIfttt = makeRequestIfttt(serviceKey, makeUUID, request);

let val;
let postSpy;

describe('requestIfttt', () => {
  beforeEach(() => {
    val = null;
    postSpy = sinon.spy(request, 'post');
  });

  afterEach(() => {
    postSpy.restore();
  });

  it('should create correct headers', async () => {
    const body = {'test': 'test'};
    await whenRequest('http://test.com', body);

    shouldSetCorrectHeaders();
    shouldHaveBody(body);
  });
});

function whenRequest(url, body) {
  return requestIfttt.post(url, body);
}

function shouldSetCorrectHeaders() {
  expect(request.post.firstCall.args[0].headers).to.deep.equal({
    'IFTTT-Service-Key': serviceKey,
    'X-Request-ID': makeUUID(),
  });
}

function shouldHaveBody(body) {
  expect(request.post.firstCall.args[0].body).to.deep.equal(body);
}
