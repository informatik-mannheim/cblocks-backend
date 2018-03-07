let co = require('co');

class ResourcePublisherUseCase{
  constructor(registry, publisher) {
    this.registry = registry;
    this.publisher = publisher;
  }

  publish(objectID, instanceID, resourceID, data){
    var that = this;

    return co(function*(){
      yield that.registry.validate(objectID, resourceID, data);

      return yield that.publisher.publishResourceValue(objectID, instanceID, resourceID, data);
    })
  }
}

module.exports = ResourcePublisherUseCase;
