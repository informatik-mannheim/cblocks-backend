let co = require('co');

class Registry{
  constructor(collection, validator){
    this.collection = collection;
    this.validator = validator;
  }

  getObject(objectID){
    let that = this;

    return (async function(){
      let o = await that.collection.findOne({"objectID": objectID});

      if(o === null){
        throw new Error("cBlock does not exist.")
      }

      return o;
    })()
  }

  getResource(objectID, resourceID){
    let that = this;

    return (async function(){
      let o = await that.getObject(objectID);

      if( that._objectHasResource(o, resourceID) )
        return o['resources'][resourceID];

      throw new Error("Resource can't be found.");
    })()
  }

  _objectHasResource(object, resourceID){
    if( object.hasOwnProperty('resources') && object['resources'].hasOwnProperty(resourceID))
      return true;
    return false;
  }

  validate(objectID, resourceID, data){
    let that = this;

    return (async function(){
      let r = await that.getResource(objectID, resourceID);

      let result = that.validator.validate(data, r.schema);

      if(result.valid) return;

      throw new Error(result.errors[0].stack);
    })()
  }
}

module.exports = Registry;
