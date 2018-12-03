const EntityNotFoundError = require('../core/entityNotFoundError.js');

class Registry {
  constructor(collection, makeCblock) {
    this.collection = collection;
    this.makeCblock = makeCblock;
  }

  async getObject(objectID) {
    console.log(objectID);

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
