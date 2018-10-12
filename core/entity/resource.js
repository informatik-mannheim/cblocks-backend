// TODO put data provider methods in here

class Resource {
  constructor(validator) {
    this.validator = validator;
  }

  isNumeric() {
    return (this.schema.type === 'number' || this.schema.type === 'integer');
  }
}

exports.make = (dto) =>
  Object.create(Resource.prototype, Object.getOwnPropertyDescriptors(dto));
