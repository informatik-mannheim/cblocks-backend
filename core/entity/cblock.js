const makeResource = require('./resource.js').make;
const EntityNotFoundError = require('../entityNotFoundError.js');

class Cblock {
  getResource(id) {
    if (this.hasOwnProperty('resources')
      && this.resources.hasOwnProperty(id)) {
      return this.resources[id];
    }

    throw new EntityNotFoundError('Resource not found.');
  }

  getInstance(id) {
    if (this.hasOwnProperty('instances')
      && this.instances.hasOwnProperty(id)) {
      return this.instances[id];
    }

    throw new EntityNotFoundError('Instance not found.');
  }
}

exports.make = (dto) => {
  const o = Object.assign(new Cblock(), dto);

  for (const prop in o.resources) {
    if (o.resources.hasOwnProperty(prop)) {
      o.resources[prop] = makeResource(o.resources[prop]);
    }
  }

  return o;
};
