const ObjectID = require('mongodb').ObjectID;
const DEFAULT_RECORD_LIMIT = 50;

class MappingsOutputDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async record(mappingID, from, to, timestamp) {
    await this.collection.insert({
      mappingID, from, to, timestamp,
    });
  }

  async getRecords(mappingID, limit) {
    if (limit === 0) return [];

    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection
      .find({
        'mappingID': new ObjectID(mappingID),
      })
      .sort({
        'timestamp': -1,
      })
      .limit(limit)
    ).toArray();

    return records.map(({_id: id, ...rest}) => ({
      id, ...rest,
    }));
  }

  async getRecordsByTo(mappingID, to, limit) {
    if (limit === 0) return [];

    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection
      .find({
        'mappingID': new ObjectID(mappingID),
        to}
      )
      .sort({
        'timestamp': -1,
      })
      .limit(limit)
    ).toArray();

    return records.map(({_id: id, ...rest}) => ({
      id, ...rest,
    }));
  }
}

module.exports = MappingsOutputDataProvider;
