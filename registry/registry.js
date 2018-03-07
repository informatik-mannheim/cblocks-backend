let co = require('co');

class Registry{
  constructor(db, validator){
    this.db = db;
    this.validator = validator;
  }

  getObject(objectID){
    let that = this;

    return co(function*(){
      let o = yield that.db.find({"objectID": objectID});

      return o;
    })
  }

  getResource(objectID, resourceID){
    let that = this;

    return co(function*(){
        let o = yield that.getObject(objectID);

        if( that.objectHasResource(o, resourceID) )
          return Promise.resolve(o['resources'][resourceID]);

        return Promise.reject(new Error("Resource can't be found."));
    });
  }

  objectHasResource(object, resourceID){
    if( object.hasOwnProperty('resources') && object['resources'].hasOwnProperty(resourceID))
      return true;
    return false;
  }

  validate(objectID, resourceID, data){
    let that = this;

    return co(function*(){
      let r = yield that.getResource(objectID, resourceID);

      let result = that.validator.validate(data, r.schema);

      if(result.valid)
        return Promise.resolve();
      else
        return Promise.reject(new Error(result.errors[0].stack));
    })
  }
}

module.exports = Registry;
