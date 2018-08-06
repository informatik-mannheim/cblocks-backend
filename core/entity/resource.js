class Resource {
  constructor(type) {
    this._type = type;
  }

  isNumeric() {
    return (this._type === 'number' || this._type === 'integer');
  }
}

exports.make = (dto) => {
  return new Resource(dto.schema.type);
};
