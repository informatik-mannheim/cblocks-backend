class ResourcePublisherUseCase{
  constructor(registry, publisher) {
    this.registry = registry;
    this.publisher = publisher;
  }

  publish(objectID, instanceID, resourceID, data){
    var that = this;

    return (async () => {
      await that.registry.validate(objectID, resourceID, data);

      return await that.publisher.publishResourceValue(objectID, instanceID, resourceID, data);
    })()
  }
}

module.exports = ResourcePublisherUseCase;
