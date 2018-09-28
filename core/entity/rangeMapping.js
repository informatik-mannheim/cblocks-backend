class RangeMapping {
  constructor(fromMin, fromMax, toMin, toMax) {
    this._fromMin = fromMin;
    this._fromMax = fromMax;
    this._toMin = toMin;
    this._toMax = toMax;
  }

  apply(val) {
    val = parseFloat(val);

    if (val < this._fromMin) {
      return this._toMin;
    }

    if (val > this._fromMax) {
      return this._toMax;
    }

    return (val - this._fromMin) * (this._toMax - this._toMin) /
      (this._fromMax - this._fromMin) + this._toMin;
  }

  isApplicableFor(resource) {
    return resource.isNumeric();
  }
}

exports.makeOutput = (dto) => {
  return new RangeMapping(dto.greaterEqualsThan, dto.lessEqualsThan, 0, 100);
};

exports.makeInput = (dto) => {
  return new RangeMapping(0, 100, dto.greaterEqualsThan, dto.lessEqualsThan);
};
