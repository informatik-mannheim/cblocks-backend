module.exports = () => {
  let r = {};
  r.entities = {};

  r.entities.rangeMapping = require('../core/entity/mappings/rangeMapping.js');
  r.entities.categoryMapping = require('../core/entity/mappings/categoryMapping.js');
  r.entities.labelToValueMapping =
    require('../core/entity/mappings/labelToValueMapping.js');
  r.entities.valueToLabelMapping =
    require('../core/entity/mappings/valueToLabelMapping.js');
  r.entities.resource = require('../core/entity/resource.js');

  return r;
};
