class CBlockUseCase {
  constructor(registry) {
    this.registry = registry;
  }

  async getCBlock(objectID) {
    return await this.registry.getObject(objectID);
  }

  async getCBlocks() {
    return await this.registry.getObjects();
  }

  async setInstanceLabel(objectID, instanceID, label) {
    const o = await this.registry.getObject(objectID);
    o.getInstance(instanceID).label = label;

    return await this.registry.updateObject(o);
  }
}

module.exports = CBlockUseCase;
