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
}

module.exports = CBlockUseCase;
