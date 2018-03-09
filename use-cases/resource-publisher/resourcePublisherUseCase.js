class ResourcePublisherUseCase{
  constructor(registry, publisher) {
    this.registry = registry;
    this.publisher = publisher;
  }

  async publish(objectID, instanceID, resourceID, data){
    await this.registry.validate(objectID, resourceID, data);

    return await this.publisher.publishResourceValue(objectID, instanceID, resourceID, data);
  }
}

module.exports = ResourcePublisherUseCase;
