class Validator {
  constructor(SchemaValidator, schema) {
    this.SchemaValidator = SchemaValidator,
    this.schema = schema;
  }

  validate(o) {
    const validator = new this.SchemaValidator();
    const r = validator.validate(o, this.schema);

    if (!r.valid) throw new Error(r.errors[0].stack);
  }
}

module.exports = Validator;
