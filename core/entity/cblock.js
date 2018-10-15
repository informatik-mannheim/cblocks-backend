const makeResource = require('./resource.js').make;

class Cblock {
  getResource(id) {
    if (this.hasOwnProperty('resources')
      && this.resources.hasOwnProperty(id)) {
      return this.resources[id];
    }

    throw new Error('Resource not found.');
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
