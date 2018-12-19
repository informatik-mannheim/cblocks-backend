const ResourceWriteError = require('./resourceWriteError.js');

class ResourceWriteUseCase {
  constructor(registry, writer) {
    this.registry = registry;
    this.writer = writer;
  }

  async write(clientID, objectID, instanceID, resourceID, data) {
    try {
      const o = await this.registry.getObject(objectID);
      o.getResource(resourceID).validateWrite(data.data);

      return await this.writer
        .writeResourceValue(clientID, objectID, instanceID, resourceID, data);
    } catch (e) {
      throw new ResourceWriteError(e.message);
    }
  }
}

module.exports = ResourceWriteUseCase;
