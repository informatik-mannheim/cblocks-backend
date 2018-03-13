class Registry {
  constructor(collection, validator) {
    this.collection = collection;
    this.validator = validator;
  }

  async getObject(objectID) {
    const o = await this.collection.findOne({'objectID': objectID});

    if (o === null) {
      throw new Error('cBlock does not exist.');
    }

    return o;
  }

  async getResource(objectID, resourceID) {
    const o = await this.getObject(objectID);

    if (this._objectHasResource(o, resourceID)) {
      return o.resources[resourceID];
    }

    throw new Error('Resource can\'t be found.');
  }

  _objectHasResource(object, resourceID) {
    if (object.hasOwnProperty('resources')
      && object.resources.hasOwnProperty(resourceID)) {
      return true;
    }
    return false;
  }

  async validate(objectID, resourceID, data) {
    const r = await this.getResource(objectID, resourceID);

    const result = this.validator.validate(data, r.schema);

    if (result.valid) return;

    throw new Error(result.errors[0].stack);
  }

  async validateWrite(objectID, resourceID, data) {
    const r = await this.getResource(objectID, resourceID);

    if (!r.is_writeable) {
      throw new Error('Resource is not writable.');
    }

    const result = this.validator.validate(data, r.schema);

    if (result.valid) return;

    throw new Error(result.errors[0].stack);
  }
}

module.exports = Registry;
