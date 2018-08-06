const ObjectID = require('mongodb').ObjectID;
const EntityNotFoundError = require('../core/entityNotFoundError.js');

class MappingsDataProvider { // TODO inject entity factory to make actual entities
  constructor(collection) {
    this.collection = collection;
  }

  async getMapping(id) {
    const m = await this.collection.findOne({'_id': new ObjectID(id)});

    if (m === null) {
      throw new EntityNotFoundError('Mapping not found');
    }

    m.mappingID = m._id;
    delete m._id;

    return m;
  }

  async getMappings() {
    let r = await this.collection.find().toArray();

    r = r.map((m) => {
      m.mappingID = m._id;
      delete m._id;

      return m;
    });

    return r;
  }

  async deleteMapping(id) {
    const r = await this.collection.remove({
      '_id': new ObjectID(id),
    });

    if (r.result.n === 0) {
      throw new EntityNotFoundError('Mapping not found');
    }
  }

  async putMapping(id, object) {
    const r = await this.collection.updateOne({
      '_id': new ObjectID(id),
    }, {
      $set: object,
    });

    if (r.result.nModified === 0) {
      throw new EntityNotFoundError('Mapping not found');
    }

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
