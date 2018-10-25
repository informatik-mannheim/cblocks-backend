class TriggersDataProvider {
  constructor(collection) {
    this.collection = collection;
  }

  async updateTriggerIdentity(triggerName, triggerIdentity) {
    const document = {
      triggerName,
      triggerIdentity,
    };

    await this.collection.update({triggerIdentity}, document, {
      'upsert': true,
    });
  }

  async getTriggerIdentities(triggerName) {
    return (await this.collection.find({triggerName})).toArray();
  }

  async deleteTriggerIdentity(triggerName, triggerIdentity) {
    const r = await this.collection.deleteOne({triggerName, triggerIdentity});

    return r.deletedCount > 0;
  }
}

module.exports = TriggersDataProvider;
