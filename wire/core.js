module.exports = () => {
  let r = {};
  r.entities = {};

  r.entities.rangeMapping = require('../core/entity/rangeMapping.js');
  r.entities.categoryMapping = require('../core/entity/categoryMapping.js');
  r.entities.resource = require('../core/entity/resource.js');

  return r;
};
