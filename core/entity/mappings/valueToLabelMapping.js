const deepEqual = require('deep-equal');

class ValueToLabelMapping {
  constructor(defaultValue, labels) {
    this._default = defaultValue;
    this._labels = labels;
  }

  apply(val) {
    const findIndex = (() => {
      try {
        const jsonVal = JSON.parse(val);

        return (element) => deepEqual(element['value'], jsonVal);
      } catch (e) {
        return (element) => element['value'] === val;
      }
    })();

    const i = this._labels.findIndex(findIndex);

    return i >= 0 ? this._labels[i]['label'] : this._default;
  }

  isApplicableFor(resource) {
    return true;
  }
}

exports.make = (dto) => {
  return new ValueToLabelMapping(dto.default, dto.labels);
};
