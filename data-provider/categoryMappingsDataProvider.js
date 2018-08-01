const ObjectID = require('mongodb').ObjectID;

class MappingsDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async getCategoryMapping(id) {
    const m = await this.collection.findOne({'_id': new ObjectID(id)});

    if (m === null) {
      throw new Error('Mapping could not be found.');
    }

    return m;
  }

  async getCategoryMappings() {
    const r = await this.collection.find().toArray();

    if (!r.length) throw Error('No Mappings found.');

    return r;
  }

  async deleteCategoryMapping(id) {
    const r = await this.collection.remove({
      '_id': new ObjectID(id),
    });

    return r;
  }

  async putCategoryMapping(id, object) {
    const r = await this.collection.updateOne({
      '_id': new ObjectID(id),
    }, {
      $set: object,
    });

    if (r.result.nModified === 0) throw new Error('Mapping could not be found.');

    object.mappingID = id;

    return object;
  }

  async createCategoryMapping(object) {
    const r = await this.collection.insert(object);

    object.mappingID = object._id;
    delete object._id;

    return object;
  }
}

module.exports = MappingsDataProvider;
