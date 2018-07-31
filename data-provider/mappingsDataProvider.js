class MappingsDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async getCategoryMapping(id) {
    const m = await this.collection.findOne({'mappingID': id});

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

  async putCategoryMapping(id, object) {
    return await this.collection.updateOne({
      'mappingID': id,
    }, {
      $set: object,
    }, {
      upsert: true,
    });
  }
}

module.exports = MappingsDataProvider;
