class CategoryMapping {
  constructor(defaultValue, ranges) {
    this._defaultValue = defaultValue;
    this._ranges = ranges;
  }

  apply(val) {
    val = parseFloat(val);

    for (let i = 0; i < this._ranges.length; i++) {
      const r = this._ranges[i];

      if (val >= r.greaterEqualsThan && val < r.lessThan) {
        return r.label;
      }
    }

    return this._defaultValue;
  }

  isApplicableFor(resource) {
    return resource.isNumeric();
  }
}

exports.make = (dto) => {
  return new CategoryMapping(dto.default, dto.ranges);
};
