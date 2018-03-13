class CBlockUseCase {
  constructor(registry) {
    this.registry = registry;
  }

  async getCBlock(objectID) {
    return await this.registry.getObject(objectID);
  }
}

module.exports = CBlockUseCase;
