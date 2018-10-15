const JsonValidator = new (require('jsonschema').Validator);

class Resource {
  isNumeric() {
    return (this.schema.type === 'number' || this.schema.type === 'integer');
  }

  validateWrite(data) {
    if (!this.is_writeable) {
      throw new Error('Resource is not writable.');
    }

    const result = JsonValidator.validate(data, this.schema);

    if (result.valid) return;

    throw new Error(result.errors[0].stack);
  }
}

exports.make = (dto) => Object.assign(new Resource(), dto);
