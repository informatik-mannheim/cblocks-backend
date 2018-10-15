const ResourceWriteError = require('./resourceWriteError.js');

class ResourceWriteUseCase {
  constructor(registry, writer, validateWrite) {
    this.registry = registry;
    this.writer = writer;
    this.validateWrite = validateWrite;
  }

  async write(clientID, objectID, instanceID, resourceID, data) {
    try {
      const o = await this.registry.getObject(objectID);
      this.validateWrite(o.getResource(resourceID), data.data);

      return await this.writer
        .writeResourceValue(clientID, objectID, instanceID, resourceID, data);
    } catch (e) {
      throw new ResourceWriteError(e.message);
    }
  }
}

module.exports = ResourceWriteUseCase;
