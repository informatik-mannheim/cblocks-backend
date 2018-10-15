class Resource {
  isNumeric() {
    return (this.schema.type === 'number' || this.schema.type === 'integer');
  }
}

exports.make = (dto) => Object.assign(new Resource(), dto);
