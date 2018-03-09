class ResourceWriteUseCase{
  constructor(registry, writer) {
    this.registry = registry;
    this.writer = writer;
  }

  async write(objectID, instanceID, resourceID, data){
    await this.registry.validateWrite(objectID, resourceID, data);

    return await this.writer.writeResourceValue(objectID, instanceID, resourceID, data);
  }
}

module.exports = ResourceWriteUseCase;
