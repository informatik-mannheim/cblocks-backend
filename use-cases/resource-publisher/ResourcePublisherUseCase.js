class ResourcePublisherUseCase{
  constructor(registry, publisher) {
    this.registry = registry;
    this.publisher = publisher;
  }

  publish(objectID, instanceID, resourceID, data){
    var that = this;

    return this.registry.validate(objectID, resourceID, data)
      .then(() => {
        return that.publisher.publish(objectID, instanceID, resourceID, data);
      });
  }
}

module.exports = ResourcePublisherUseCase;
