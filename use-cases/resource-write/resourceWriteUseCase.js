class ResourceWriteUseCase {
  constructor(registry, writer) {
    this.registry = registry;
    this.writer = writer;
  }

  async write(clientID, objectID, instanceID, resourceID, data) {
    await this.registry.validateWrite(objectID, resourceID, data.data);

    return await this.writer
      .writeResourceValue(clientID, objectID, instanceID, resourceID, data);
  }
}

module.exports = ResourceWriteUseCase;
