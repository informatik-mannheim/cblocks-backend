class ResourceWriteUseCase{
  constructor(registry, writer) {
    this.registry = registry;
    this.writer = writer;
  }

  write(objectID, instanceID, resourceID, data){
    var that = this;

    return (async () => {
      await that.registry.validateWrite(objectID, resourceID, data);

      return await that.writer.writeResourceValue(objectID, instanceID, resourceID, data);
    })()
  }
}

module.exports = ResourceWriteUseCase;
