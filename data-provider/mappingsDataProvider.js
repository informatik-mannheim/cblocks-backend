const ObjectID = require('mongodb').ObjectID;

class MappingsDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async getMapping(id) {
    const m = await this.collection.findOne({'_id': new ObjectID(id)});

    if (m === null) {
      throw new Error('Mapping could not be found.');
    }

    return m;
  }

  async getMappings() {
    const r = await this.collection.find().toArray();

    if (!r.length) throw Error('No Mappings found.');

    return r;
  }

  async deleteMapping(id) {
    const r = await this.collection.remove({
      '_id': new ObjectID(id),
    });

    return r;
  }

  async putMapping(id, object) {
    const r = await this.collection.updateOne({
      '_id': new ObjectID(id),
    }, {
      $set: object,
    });

    if (r.result.nModified === 0) throw new Error('Mapping could not be found.');

    return {...object, 'mappingID': id};
  }

  async createMapping(object) {
    await this.collection.insert(object);

    let r = {
      ...object,
      'mappingID': object._id,
    };

    delete r._id;

    return r;
  }
}

module.exports = MappingsDataProvider;
