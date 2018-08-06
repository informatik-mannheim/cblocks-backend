class RangeMapping {
  apply(val) {
    if (val < this.greaterEqualsThan) {
      return 0;
    }

    if (val > this.lessEqualsThan) {
      return 100;
    }

    return (val-this.greaterEqualsThan) /
      (this.lessEqualsThan - this.greaterEqualsThan) * 100;
  }
}

exports.Prototype = RangeMapping;

exports.make = (object) => {
  return Object.assign(new RangeMapping(), object);
};
