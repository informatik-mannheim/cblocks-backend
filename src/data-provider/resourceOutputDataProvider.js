const DEFAULT_RECORD_LIMIT = 50;

class ResourceOutputDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async record(ipso, value) {
    const r = {
      ...ipso,
      ...value,
    };

    await this.collection.insert(r);
  }

  async getRecords(ipso, limit) {
    if (limit === 0) return [];

    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection
      .find(ipso)
      .sort({
        'timestamp': -1,
      })
      .limit(limit)
    ).toArray();

    return records.map((item) => {
      return {
          'timestamp': item.timestamp,
          'value': item.value,
          'id': item._id.toHexString(),
      };
    });
  }
}

module.exports = ResourceOutputDataProvider;
