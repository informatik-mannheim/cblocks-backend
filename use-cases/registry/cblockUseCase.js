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
    return await this.registry.setInstanceLabel(objectID, instanceID, label);
  }
}

module.exports = CBlockUseCase;
