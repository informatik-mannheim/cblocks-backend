const makeResource = require('./resource.js').make;

exports.make = (dto) => {
  const o = Object.assign(dto);

  for (const prop in o.resources) {
    if (o.resources.hasOwnProperty(prop)) {
      o.resources[prop] = makeResource(o.resources[prop]);
    }
  }

  return o;
};
