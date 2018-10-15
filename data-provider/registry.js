const EntityNotFoundError = require('../core/entityNotFoundError.js');

class Registry {
  constructor(collection, makeCblock) {
    this.collection = collection;
    this.makeCblock = makeCblock;
  }

  async getObject(objectID) {
    const o = await this.collection.findOne({'objectID': objectID});

    if (o === null) {
      throw new EntityNotFoundError('cBlock not found.');
    }

    return this.makeCblock(o);
  }

  async getObjects() {
    const data = await this.collection.find().toArray();
    const cblocks = data.map((o) => this.makeCblock(o));

    return cblocks;
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

    throw new EntityNotFoundError('Instance not found.');
  }

  async getInstance(objectID, instanceID) {
    const o = await this.getObject(objectID);

    if (this._objectHasInstance(o, instanceID)) {
      return o.instances[instanceID];
    }

    throw new EntityNotFoundError('Instance not found.');
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
}

module.exports = Registry;
