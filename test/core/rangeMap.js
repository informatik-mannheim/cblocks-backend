const chai = require('chai');
const expect = chai.expect;

const rangeMap = require('../../core/rangeMap.js');

let value;

describe('Range Map', () => {
  it('should return 0 if value less min', () => {
    whenValueLessMinValue();

    shouldReturnMinValue();
  });

  it('should return 100 if value higher than max', () => {
    whenValueMoreThanMax();

    shouldReturnMaxValue();
  });

  it('should be 50% in the middle', () => {
    whenValueInMiddle();

    shouldReturn50();
  });
});

function whenValueLessMinValue() {
  value = rangeMap(5, 10, 20);
}

function shouldReturnMinValue() {
  expect(value).to.equal(0);
}

function whenValueMoreThanMax() {
  value = rangeMap(25, 10, 20);
}

function shouldReturnMaxValue() {
  expect(value).to.equal(100);
}

function whenValueInMiddle() {
  value = rangeMap(15, 10, 20);
}

function shouldReturn50() {
  expect(value).to.equal(50);
}
