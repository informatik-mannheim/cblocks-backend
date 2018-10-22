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
    limit = limit || DEFAULT_RECORD_LIMIT;

    const records = await (this.collection.find(ipso).limit(limit)).toArray();

    return records.map((item) => {
      return {
          'timestamp': item.timestamp,
          'value': item.value,
      };
    });
  }
}

module.exports = ResourceOutputDataProvider;
