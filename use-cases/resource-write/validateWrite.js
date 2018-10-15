// TODO service locator and use own validator
const JsonValidator = new (require('jsonschema').Validator);

module.exports = (resource, data) => {
  if (!resource.is_writeable) {
    throw new Error('Resource is not writable.');
  }

  const result = JsonValidator.validate(data, resource.schema);

  if (result.valid) return;

  throw new Error(result.errors[0].stack);
};
