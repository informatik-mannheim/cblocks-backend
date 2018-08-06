class RangeMapping {
  constructor(min, max) {
    this._min = min;
    this._max = max;
  }

  apply(val) {
    val = parseFloat(val);

    if (val < this._min) {
      return 0;
    }

    if (val > this._max) {
      return 100;
    }

    return (val-this._min) /
      (this._max - this._min) * 100;
  }

  isApplicableFor(resource) {
    return resource.isNumeric();
  }
}

exports.make = (dto) => {
  return new RangeMapping(dto.greaterEqualsThan, dto.lessEqualsThan);
};
