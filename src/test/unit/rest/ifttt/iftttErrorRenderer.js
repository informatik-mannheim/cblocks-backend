const chai = require('chai');
const expect = chai.expect;
const Boom = require('boom');

const errorRenderer = require('../../../../rest/util/iftttErrorRenderer.js');
const renderError = errorRenderer(Boom.boomify);

let val;

describe('renderError', () => {
  beforeEach(async () => {
    val = null;
  });

  it('should return correct format', () => {
    whenRender(new Error('Test error.'), {statusCode: 400});

    shouldHave('Test error.');
  });
});

function whenRender(e, options) {
  val = renderError(e, options);
}

function shouldHave(message) {
  expect(val.output.payload.errors[0].message).to.equal(message);
}
