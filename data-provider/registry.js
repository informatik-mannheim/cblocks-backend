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

  async getObjects() {
    return await this.collection.find().toArray();
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

  async setInstanceLabel(objectID, instanceID, label) {
    const o = await this.getObject(objectID);

    return await this._updateInstanceLabel(o, instanceID, label);
  }

  async _updateInstanceLabel(object, instanceID, label) {
    if (this._objectHasInstance(object, instanceID)) {
      object['instances'][instanceID]['label'] = label;
      return await this.updateObject(object);
    }

    throw new Error('Instance not found.');
  }

  async getInstance(objectID, instanceID) {
    const o = await this.getObject(objectID);

    if (this._objectHasInstance(o, instanceID)) {
      return o.instances[instanceID];
    }

    throw new Error('Instance not found.');
  }

  _objectHasInstance(object, instanceID) {
    if (object.hasOwnProperty('instances')
      && object.instances.hasOwnProperty(instanceID)) {
      return true;
    }
    return false;
  }

  async updateObject(object) {
    return await this.collection.updateOne({
      'objectID': object.objectID,
    }, {
      $set: object,
    }, {
      upsert: true,
    });
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
