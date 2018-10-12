class LabelToValueMapping {
  constructor(labels) {
    this._labels = labels;
  }

  apply(label) {
    console.log(label);
    const i = this._labels.findIndex((e) => e['label'] === label);

    if (i === -1) throw new Error('Label not found.');

    return this._labels[i]['value'];
  }

  isApplicableFor(resource) {
    return true;
  }
}

exports.make = (dto) => {
  return new LabelToValueMapping(dto.labels);
};
