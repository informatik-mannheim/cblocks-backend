const chai = require('chai');
const expect = chai.expect;

const RangeMap = require('../../../../core/entity/rangeMapping.js');
const stubs = require('../../../stubs/rangeMappings');

let map;
let value;

describe('Range Map', () => {
  it('should return 0 if value less min', () => {
    givenMap();

    whenValueLessMinValue();

    shouldReturnMinValue();
  });

  it('should return 100 if value higher than max', () => {
    givenMap();

    whenValueMoreThanMax();

    shouldReturnMaxValue();
  });

  it('should be 50% in the middle', () => {
    givenMap();

    whenValueInMiddle();

    shouldReturn50();
  });
});

function givenMap() {
  map = RangeMap.make(stubs.temperatureRangeMapping);
}

function whenValueLessMinValue() {
  value = map.apply(5);
}

function shouldReturnMinValue() {
  expect(value).to.equal(0);
}

function whenValueMoreThanMax() {
  value = map.apply(35);
}

function shouldReturnMaxValue() {
  expect(value).to.equal(100);
}

function whenValueInMiddle() {
  value = map.apply(25);
}

function shouldReturn50() {
  expect(value).to.equal(50);
}
